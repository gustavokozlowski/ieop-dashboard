/**
 * Instância axios centralizada.
 * - Injeta access_token em toda requisição
 * - 401: tenta refresh silencioso com fila de retries
 * - 500+: dispara CustomEvent "api:error" para o ToastContainer
 */

import axios from "axios";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "../auth/tokenStore";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

// Quando BUN_PUBLIC_API_URL está setada (ex.: Vercel), usa a URL pública da API
// embutida no build; senão cai no proxy do servidor Bun (/proxy), usado no dev
// para evitar CORS. Bun inlina `process.env["BUN_PUBLIC_API_URL"]` como literal
// no bundle, então não há referência a `process` em runtime.
//
// Não gateamos por NODE_ENV: no build do Bun na Vercel o `--env` faz o NODE_ENV
// vir do ambiente (não do --define) e nem sempre é "production", o que zerava a
// URL e forçava "/proxy". Pra rodar o dev com proxy, deixe BUN_PUBLIC_API_URL
// fora do .env local e aponte o backend via API_PROXY_TARGET (vide src/index.ts).
export const BASE_URL = process.env["BUN_PUBLIC_API_URL"] || "/proxy";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ── Request: inject access token ─────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response: 401 refresh + 500 toast ────────────────────────────
let refreshing = false;
type QueueEntry = { resolve: (token: string) => void; reject: (err: unknown) => void };
let queue: QueueEntry[] = [];

function drainQueue(err: unknown, token: string | null) {
  queue.forEach(({ resolve, reject }) => (err ? reject(err) : resolve(token!)));
  queue = [];
}

// Separate instance to avoid interceptor loop during refresh
const rawAxios = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

apiClient.interceptors.response.use(
  (res) => res,
  async (err: unknown) => {
    if (!axios.isAxiosError(err)) return Promise.reject(err);

    const original = err.config;
    const status = err.response?.status;

    // ── 401: silent refresh usando o refresh_token armazenado ─────
    if (status === 401 && original && !original._retry) {
      const refreshToken = getRefreshToken();

      // Sem refresh_token não há o que renovar → desautentica.
      if (!refreshToken) {
        clearTokens();
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(err);
      }

      if (refreshing) {
        return new Promise<string>((resolve, reject) => queue.push({ resolve, reject })).then(
          (token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return apiClient(original);
          },
        );
      }

      original._retry = true;
      refreshing = true;

      try {
        const { data } = await rawAxios.post<TokenResponse>("/api/v1/auth/refresh", {
          refresh_token: refreshToken,
        });
        setTokens(data.access_token, data.refresh_token);
        drainQueue(null, data.access_token);
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return apiClient(original);
      } catch (refreshErr) {
        clearTokens();
        drainQueue(refreshErr, null);
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(refreshErr);
      } finally {
        refreshing = false;
      }
    }

    // ── 500+: dispatch toast event ────────────────────────────────
    if (status !== undefined && status >= 500) {
      window.dispatchEvent(
        new CustomEvent("api:error", {
          detail: { status, url: original?.url ?? "", method: original?.method ?? "" },
        }),
      );
    }

    return Promise.reject(err);
  },
);

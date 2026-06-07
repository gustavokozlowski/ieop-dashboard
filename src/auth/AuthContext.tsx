import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";
import type { Perfil, UserResponse } from "../schemas/auth.schema";
import { getMe, loginUser, refreshTokens, registerUser } from "../services/auth";
import { clearTokens, getRefreshToken, setTokens } from "./tokenStore";

// ── Types ─────────────────────────────────────────────────────────

// Usuário autenticado = UserResponse do schema (inclui perfil de acesso).
export type AuthUser = UserResponse;

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (nome: string, email: string, password: string, perfil: Perfil) => Promise<void>;
  logout: () => void;
}

// ── Context ───────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const setUnauthenticated = useCallback(() => {
    clearTokens();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const setAuthenticated = useCallback((user: AuthUser) => {
    setState({ user, isAuthenticated: true, isLoading: false });
  }, []);

  // Restaura a sessão no mount: se há refresh_token, renova e busca /me.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        if (!cancelled) setUnauthenticated();
        return;
      }
      try {
        const tokens = await refreshTokens(refreshToken);
        setTokens(tokens.access_token, tokens.refresh_token);
        const user = await getMe();
        if (!cancelled) setAuthenticated(user);
      } catch {
        if (!cancelled) setUnauthenticated();
      }
    }

    restoreSession();

    // Interceptor sinaliza logout quando o refresh falha no meio da sessão
    const onAuthLogout = () => setUnauthenticated();
    window.addEventListener("auth:logout", onAuthLogout);

    return () => {
      cancelled = true;
      window.removeEventListener("auth:logout", onAuthLogout);
    };
  }, [setAuthenticated, setUnauthenticated]);

  const login = useCallback(
    async (email: string, password: string) => {
      const tokens = await loginUser(email, password);
      setTokens(tokens.access_token, tokens.refresh_token);
      const user = await getMe();
      setAuthenticated(user);
    },
    [setAuthenticated],
  );

  const register = useCallback(
    async (nome: string, email: string, password: string, perfil: Perfil) => {
      // O backend não retorna token no cadastro → cria e faz login em seguida.
      await registerUser({ nome, email, password, perfil });
      await login(email, password);
    },
    [login],
  );

  const logout = useCallback(() => {
    // Não há endpoint de logout no backend — limpeza é client-side.
    setUnauthenticated();
  }, [setUnauthenticated]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside <AuthProvider>");
  return ctx;
}

// access_token vive apenas em memória (zerado a cada reload).
// O backend retorna refresh_token no corpo da resposta (não usa cookie httpOnly),
// então o refresh_token é persistido em localStorage para sobreviver a reloads.

let accessToken: string | null = null;

const REFRESH_KEY = "ieop_refresh_token";

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_KEY, token);
}

export function clearRefreshToken(): void {
  localStorage.removeItem(REFRESH_KEY);
}

/** Persiste o par de tokens retornado por login/refresh. */
export function setTokens(accessTokenValue: string, refreshTokenValue: string): void {
  setAccessToken(accessTokenValue);
  setRefreshToken(refreshTokenValue);
}

/** Limpa ambos os tokens (logout / falha de refresh). */
export function clearTokens(): void {
  clearAccessToken();
  clearRefreshToken();
}

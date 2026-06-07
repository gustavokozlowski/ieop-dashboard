import { beforeEach, describe, expect, it, mock } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mocks do serviço de auth (sem rede).
const loginUser = mock(async () => ({
  access_token: "access-123",
  refresh_token: "refresh-123",
  token_type: "bearer",
}));
const getMe = mock(async () => ({
  id: "1",
  email: "gestor@ieop.dev",
  nome: "Gestor",
  perfil: "gestor" as const,
}));
const registerUser = mock(async () => ({
  id: "1",
  email: "gestor@ieop.dev",
  nome: "Gestor",
  perfil: "gestor" as const,
}));
const refreshTokens = mock(async () => {
  throw new Error("sem sessão");
});

mock.module("../services/auth", () => ({ loginUser, getMe, registerUser, refreshTokens }));

// Import dinâmico após o mock — garante que o AuthContext use os mocks.
const { AuthProvider, useAuthContext } = await import("./AuthContext");

function Harness() {
  const { isAuthenticated, isLoading, user, login, logout } = useAuthContext();
  return (
    <div>
      <span data-testid="status">{isLoading ? "loading" : isAuthenticated ? "in" : "out"}</span>
      <span data-testid="user">{user?.nome ?? "-"}</span>
      <span data-testid="perfil">{user?.perfil ?? "-"}</span>
      <button onClick={() => login("gestor@ieop.dev", "senha123")}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  loginUser.mockClear();
  getMe.mockClear();
});

describe("fluxo de autenticação", () => {
  it("inicia deslogado quando não há refresh_token", async () => {
    render(
      <AuthProvider>
        <Harness />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("out"));
  });

  it("login autentica, carrega o usuário (com perfil) e logout limpa", async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <Harness />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("out"));

    await user.click(screen.getByText("login"));
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("in"));
    expect(loginUser).toHaveBeenCalledWith("gestor@ieop.dev", "senha123");
    expect(screen.getByTestId("user")).toHaveTextContent("Gestor");
    expect(screen.getByTestId("perfil")).toHaveTextContent("gestor");
    // tokens persistidos
    expect(localStorage.getItem("ieop_refresh_token")).toBe("refresh-123");

    await user.click(screen.getByText("logout"));
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("out"));
    expect(localStorage.getItem("ieop_refresh_token")).toBeNull();
  });
});

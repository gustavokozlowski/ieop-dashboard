import { beforeEach, describe, expect, it, mock } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const loginUser = mock(async () => ({
  access_token: "a",
  refresh_token: "r",
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
  email: "x",
  nome: "x",
  perfil: "gestor" as const,
}));
const refreshTokens = mock(async () => {
  throw new Error("sem sessão");
});

mock.module("../services/auth", () => ({ loginUser, getMe, registerUser, refreshTokens }));

const { AuthProvider } = await import("./AuthContext");
const { LoginPage } = await import("./LoginPage");

function renderLogin() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>DASHBOARD</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  loginUser.mockClear();
});

describe("LoginPage (integração)", () => {
  it("valida campos vazios com mensagens do Zod", async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByRole("button", { name: /entrar/i }));
    expect(await screen.findByText("Informe seu e-mail")).toBeInTheDocument();
    expect(screen.getByText("Informe sua senha")).toBeInTheDocument();
    expect(loginUser).not.toHaveBeenCalled();
  });

  it("faz login e redireciona para o dashboard", async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText("E-mail"), "gestor@ieop.dev");
    await user.type(screen.getByLabelText("Senha"), "senha123");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => expect(screen.getByText("DASHBOARD")).toBeInTheDocument());
    expect(loginUser).toHaveBeenCalledWith("gestor@ieop.dev", "senha123");
  });

  it("mostra erro de credenciais inválidas (401)", async () => {
    const user = userEvent.setup();
    loginUser.mockImplementationOnce(async () => {
      const err = new Error("401") as Error & { response?: { status: number } };
      err.response = { status: 401 };
      throw err;
    });
    renderLogin();
    await user.type(screen.getByLabelText("E-mail"), "gestor@ieop.dev");
    await user.type(screen.getByLabelText("Senha"), "errada");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(await screen.findByText("E-mail ou senha incorretos.")).toBeInTheDocument();
  });
});

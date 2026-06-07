import { beforeEach, describe, expect, it, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Controla o perfil retornado por /me (via mock do serviço de auth, sem rede).
let currentPerfil: "admin" | "gestor" | "readonly" = "readonly";

mock.module("../services/auth", () => ({
  loginUser: mock(async () => ({ access_token: "a", refresh_token: "r", token_type: "bearer" })),
  registerUser: mock(async () => ({ id: "1", email: "x", nome: "x", perfil: currentPerfil })),
  refreshTokens: mock(async () => ({
    access_token: "a",
    refresh_token: "r",
    token_type: "bearer",
  })),
  getMe: mock(async () => ({ id: "1", email: "x@x.com", nome: "User", perfil: currentPerfil })),
}));
// ChatPage é pesado (mapa/recharts); stub para isolar o teste do guard.
mock.module("../pages/ChatPage", () => ({ ChatPage: () => <div>CHAT_PAGE</div> }));

const { AuthProvider } = await import("./AuthContext");
const { RagRoute } = await import("./RagRoute");

function renderRag() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <RagRoute />
      </MemoryRouter>
    </AuthProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  // refresh_token presente → AuthProvider restaura a sessão (refresh → /me)
  localStorage.setItem("ieop_refresh_token", "r");
});

describe("RagRoute (guard de /ia)", () => {
  it("bloqueia readonly com mensagem de acesso restrito", async () => {
    currentPerfil = "readonly";
    renderRag();
    expect(await screen.findByText("Acesso restrito")).toBeInTheDocument();
    expect(screen.queryByText("CHAT_PAGE")).not.toBeInTheDocument();
  });

  it("libera o chat para gestor", async () => {
    currentPerfil = "gestor";
    renderRag();
    expect(await screen.findByText("CHAT_PAGE")).toBeInTheDocument();
  });
});

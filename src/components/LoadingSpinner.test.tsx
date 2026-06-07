import { describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import { LoadingSpinner } from "./LoadingSpinner";

describe("LoadingSpinner", () => {
  it("expõe role=status para leitores de tela", () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renderiza o label acessível padrão", () => {
    render(<LoadingSpinner />);
    expect(screen.getByText("Carregando…")).toBeInTheDocument();
  });

  it("aceita um label customizado", () => {
    render(<LoadingSpinner label="Verificando sessão…" />);
    expect(screen.getByText("Verificando sessão…")).toBeInTheDocument();
  });
});

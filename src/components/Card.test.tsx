import { describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import { Card } from "./Card";

describe("Card", () => {
  it("renderiza título e valor", () => {
    render(<Card title="Total de obras" value="1.284" />);
    expect(screen.getByText("Total de obras")).toBeInTheDocument();
    expect(screen.getByText("1.284")).toBeInTheDocument();
  });

  it("mostra delta positivo (seta ▲) e label acessível", () => {
    render(<Card title="Alunos" value={10} trend={12} trendLabel="vs. mês anterior" />);
    expect(screen.getByText("12%")).toBeInTheDocument();
    expect(screen.getByTitle("vs. mês anterior")).toBeInTheDocument();
  });

  it("mostra delta negativo em valor absoluto", () => {
    render(<Card title="Alertas" value={27} trend={-15} />);
    expect(screen.getByText("15%")).toBeInTheDocument();
  });

  it("renderiza ícone quando fornecido", () => {
    render(<Card title="X" value="1" icon={<span data-testid="ic">◈</span>} />);
    expect(screen.getByTestId("ic")).toBeInTheDocument();
  });
});

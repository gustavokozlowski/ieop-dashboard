import { describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renderiza o label fornecido", () => {
    render(<Badge label="Concluída" variant="success" />);
    expect(screen.getByText("Concluída")).toBeInTheDocument();
  });

  it("usa o label padrão da variante quando label não é passado", () => {
    render(<Badge variant="danger" />);
    expect(screen.getByText("Risco alto")).toBeInTheDocument();
  });

  it("oculta o dot quando dot={false}", () => {
    const { container } = render(<Badge label="X" variant="neutral" dot={false} />);
    // o dot é o único <span> filho extra; sem ele, só o texto permanece
    expect(container.querySelectorAll("span").length).toBe(1);
  });
});

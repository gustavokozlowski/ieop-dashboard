import { describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import { IEOP_COLORS } from "../features/dashboard/ieop";
import { IEOPBadge } from "./IEOPBadge";

describe("IEOPBadge", () => {
  it("renderiza 'Ótimo' com a cor da classe", () => {
    render(<IEOPBadge classe="Ótimo" />);
    const el = screen.getByText("Ótimo");
    expect(el).toBeInTheDocument();
    expect(el).toHaveStyle({ color: IEOP_COLORS["Ótimo"]!.hex });
  });

  it("renderiza 'Crítico'", () => {
    render(<IEOPBadge classe="Crítico" />);
    expect(screen.getByText("Crítico")).toBeInTheDocument();
  });

  it("renderiza '—' quando classe é null", () => {
    render(<IEOPBadge classe={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});

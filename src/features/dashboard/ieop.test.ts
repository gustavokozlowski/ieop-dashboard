import { describe, expect, it } from "bun:test";
import { getIEOPClasse, getIEOPColor, IEOP_COLORS } from "./ieop";

describe("getIEOPClasse", () => {
  it("classifica por faixa", () => {
    expect(getIEOPClasse(85)).toBe("Ótimo");
    expect(getIEOPClasse(65)).toBe("Bom");
    expect(getIEOPClasse(45)).toBe("Regular");
    expect(getIEOPClasse(25)).toBe("Ruim");
    expect(getIEOPClasse(10)).toBe("Crítico");
  });

  it("retorna '—' para null/undefined", () => {
    expect(getIEOPClasse(null)).toBe("—");
    expect(getIEOPClasse(undefined)).toBe("—");
  });
});

describe("getIEOPColor", () => {
  it("retorna o hex da classe correspondente ao score", () => {
    expect(getIEOPColor(85)).toBe(IEOP_COLORS["Ótimo"]!.hex);
    expect(getIEOPColor(65)).toBe(IEOP_COLORS["Bom"]!.hex);
    expect(getIEOPColor(10)).toBe(IEOP_COLORS["Crítico"]!.hex);
  });

  it("retorna o hex neutro para score null", () => {
    expect(getIEOPColor(null)).toBe(IEOP_COLORS["—"]!.hex);
  });
});

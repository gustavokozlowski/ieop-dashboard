import type { IEOPClasse } from "../../schemas/ieop.schema";

// Paleta IEOP adaptada ao tema escuro do app (ver styles/tokens.css).
// hex   → cor sólida (texto, marcador, barra)
// bg    → preenchimento translúcido para badges/realces
// border→ borda do badge
export interface IEOPColor {
  hex: string;
  bg: string;
  border: string;
}

export const IEOP_COLORS: Record<string, IEOPColor> = {
  Ótimo: { hex: "#1D9E75", bg: "rgba(29,158,117,0.16)", border: "#1a6b50" },
  Bom: { hex: "#3FB984", bg: "rgba(63,185,132,0.16)", border: "#2f8a63" },
  Regular: { hex: "#BA7517", bg: "rgba(186,117,23,0.16)", border: "#7a4e0f" },
  Ruim: { hex: "#D2691E", bg: "rgba(210,105,30,0.16)", border: "#8a4513" },
  Crítico: { hex: "#A32D2D", bg: "rgba(163,45,45,0.18)", border: "#6e1e1e" },
  "—": { hex: "#555b72", bg: "rgba(85,91,114,0.15)", border: "#2a2f42" },
};

// Fallback garantido (não-undefined) para a classe sem dados.
export const IEOP_NULL_COLOR: IEOPColor = IEOP_COLORS["—"]!;

export function colorForClasse(classe: IEOPClasse | string | null): IEOPColor {
  if (classe === null) return IEOP_NULL_COLOR;
  return IEOP_COLORS[classe] ?? IEOP_NULL_COLOR;
}

export function getIEOPClasse(score: number | null | undefined): IEOPClasse | "—" {
  if (score === null || score === undefined) return "—";
  if (score >= 80) return "Ótimo";
  if (score >= 60) return "Bom";
  if (score >= 40) return "Regular";
  if (score >= 20) return "Ruim";
  return "Crítico";
}

export function getIEOPColor(score: number | null | undefined): string {
  const classe = getIEOPClasse(score);
  return (IEOP_COLORS[classe] ?? IEOP_NULL_COLOR).hex;
}

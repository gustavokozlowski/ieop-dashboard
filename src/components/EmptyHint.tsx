import type { ReactNode } from "react";

// Texto de fallback discreto (muted/itálico) para campos sem dado, no lugar
// de um "—" cru — melhora a leitura em tabelas e cabeçalhos.
export function EmptyHint({ children }: { children: ReactNode }) {
  return <span style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>{children}</span>;
}

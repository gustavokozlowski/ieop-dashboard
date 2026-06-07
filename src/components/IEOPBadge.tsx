import { colorForClasse } from "../features/dashboard/ieop";
import type { IEOPClasse } from "../schemas/ieop.schema";

interface Props {
  classe: IEOPClasse | string | null;
  size?: "sm" | "md";
}

export function IEOPBadge({ classe, size = "md" }: Props) {
  const key = classe ?? "—";
  const c = colorForClasse(classe);
  const pad = size === "sm" ? "2px 8px" : "4px 12px";
  const fontSize = size === "sm" ? "var(--text-xs)" : "var(--text-sm)";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "999px",
        fontWeight: 500,
        padding: pad,
        fontSize,
        color: c.hex,
        background: c.bg,
        border: `1px solid ${c.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {key}
    </span>
  );
}

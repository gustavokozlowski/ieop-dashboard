export { formatBRL, formatPct, normalizeNome, normalizeSecretaria } from "../dashboard/formatters";

// Aceita "YYYY-MM-DD" ou ISO com hora ("YYYY-MM-DDTHH:mm:ss"); usa só a data.
function dateParts(dateStr: string): [string, string, string] | null {
  if (!dateStr) return null;
  const parts = dateStr.slice(0, 10).split("-");
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return null;
  return [parts[0], parts[1], parts[2]];
}

/** "YYYY-MM-DD" (ou ISO) → "DD/MM/YYYY" */
export function formatDate(dateStr: string): string {
  const p = dateParts(dateStr);
  if (!p) return dateStr || "—";
  const [y, m, d] = p;
  return `${d}/${m}/${y}`;
}

/** Versão curta (lista de obras) → "DD/MM/AA" */
export function formatDateShort(dateStr: string): string {
  const p = dateParts(dateStr);
  if (!p) return dateStr || "—";
  const [y, m, d] = p;
  return `${d}/${m}/${y.slice(2)}`;
}

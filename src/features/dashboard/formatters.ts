const brlFmt = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 1,
});

const brlCompact = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatBRL(value: number): string {
  return (value >= 1_000_000 ? brlCompact : brlFmt).format(value);
}

export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

/** prob is 0–1 */
export function formatProb(prob: number): string {
  return `${(prob * 100).toFixed(0)}%`;
}

/** "2025-01" → "jan/25" */
export function formatMes(mes: string): string {
  const [year, month] = mes.split("-");
  const m = new Date(Number(year), Number(month) - 1).toLocaleString("pt-BR", { month: "short" });
  return `${m}/${String(year).slice(2)}`;
}

// ── Rótulos de secretaria ─────────────────────────────────────────
// Os nomes vêm do backend longos e em CAIXA ALTA ("SECRETARIA MUNICIPAL
// DE OBRAS", "DIRETORIA-EXECUTIVA DO FUNDO NACIONAL DE SAÚDE"…), o que
// estoura o eixo do gráfico. Normalizamos para Title Case e abreviamos
// os prefixos institucionais mais comuns. O nome completo continua
// disponível no tooltip.

const SMALL_WORDS = new Set(["de", "do", "da", "dos", "das", "e", "a", "o", "à", "ao", "em"]);

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w, i) => (i > 0 && SMALL_WORDS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

// Prefixos institucionais → abreviação. Ordem importa (mais específico antes).
const PREFIX_ABBREV: [RegExp, string][] = [
  [/^secretaria municipal adjunta\b/i, "Sec. Mun. Adj."],
  [/^secretaria municipal\b/i, "Sec. Mun."],
  [/^secretaria executiva\b/i, "Sec. Exec."],
  [/^secretaria nacional\b/i, "Sec. Nac."],
  [/^secretaria\b/i, "Sec."],
  [/^minist[ée]rio\b/i, "Min."],
  [/^diretoria[- ]executiva\b/i, "Dir. Exec."],
  [/^fundo nacional\b/i, "FN"],
  [/^instituto\b/i, "Inst."],
];

export function normalizeSecretaria(raw: string): string {
  const cleaned = raw.trim().replace(/\s+/g, " ");
  if (!cleaned) return cleaned;
  // Só re-capitaliza quando vem tudo em maiúsculas; preserva nomes já
  // legíveis ("Saúde", "Não informado").
  const hasLower = /[a-záéíóúâêôãõàç]/.test(cleaned);
  let s = hasLower ? cleaned : titleCase(cleaned);
  for (const [re, abbr] of PREFIX_ABBREV) {
    if (re.test(s)) {
      s = s.replace(re, abbr);
      break;
    }
  }
  return s;
}

export function truncate(s: string, max = 20): string {
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}

// Nome de obra/contrato: vem longo e muitas vezes em CAIXA ALTA. Só
// re-capitaliza quando está todo em maiúsculas (preserva nomes já legíveis).
export function normalizeNome(raw: string): string {
  const cleaned = raw.trim().replace(/\s+/g, " ");
  if (!cleaned) return cleaned;
  const hasLower = /[a-záéíóúâêôãõàç]/.test(cleaned);
  return hasLower ? cleaned : titleCase(cleaned);
}

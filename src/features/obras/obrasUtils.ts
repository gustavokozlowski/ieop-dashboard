import { getRiscoNivel } from "../mapa/mapaUtils";
import type { ObraListItem, ObrasFilter } from "./types";

export function filterObras(obras: ObraListItem[], filter: ObrasFilter): ObraListItem[] {
  return obras.filter((o) => {
    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (!o.nome.toLowerCase().includes(q) && !o.numero_contrato.toLowerCase().includes(q))
        return false;
    }
    if (filter.status !== "todos" && o.status !== filter.status) return false;
    if (filter.secretaria !== "todas" && o.secretaria !== filter.secretaria) return false;
    // bairro: compara sem acento/caixa (o dropdown deduplica "Macae"/"Macaé").
    if (filter.bairro !== "todos" && foldKey(o.bairro) !== foldKey(filter.bairro)) return false;
    if (filter.risco !== "todos" && getRiscoNivel(o.prob_atraso) !== filter.risco) return false;
    if (filter.periodoInicio && o.previsao_termino < filter.periodoInicio) return false;
    if (filter.periodoFim && o.previsao_termino > filter.periodoFim) return false;
    return true;
  });
}

// Chave para deduplicar ignorando acento/caixa ("Macae" == "Macaé").
function foldKey(v: string): string {
  return v
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

const hasAccent = (v: string): boolean => /\p{Diacritic}/u.test(v.normalize("NFD"));

export function getDistinct(obras: ObraListItem[], field: keyof ObraListItem): string[] {
  // Exclui vazios e o placeholder "—"; deduplica por acento/caixa, mantendo a
  // variante acentuada (ex.: prefere "Macaé" a "Macae").
  const best = new Map<string, string>();
  for (const o of obras) {
    const v = String(o[field] ?? "").trim();
    if (!v || v === "—") continue;
    const key = foldKey(v);
    const cur = best.get(key);
    if (!cur || (hasAccent(v) && !hasAccent(cur))) best.set(key, v);
  }
  return [...best.values()].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function escapeField(v: string | number): string {
  const s = String(v);
  return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
}

export function exportObrasCsv(obras: ObraListItem[]): void {
  const headers = [
    "Nome",
    "Contrato",
    "Secretaria",
    "Bairro",
    "Status",
    "Execução %",
    "Valor (R$)",
    "Risco",
    "Previsão Término",
  ];
  const rows = obras.map((o) => [
    o.nome,
    o.numero_contrato,
    o.secretaria,
    o.bairro,
    o.status,
    o.execucao_percentual.toFixed(1),
    o.valor_contratado.toFixed(2),
    getRiscoNivel(o.prob_atraso),
    o.previsao_termino,
  ]);
  const csv = [headers, ...rows].map((r) => r.map(escapeField).join(",")).join("\n");
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `obras_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

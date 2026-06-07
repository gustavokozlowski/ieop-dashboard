import { getRiscoNivel } from "../mapa/mapaUtils";
import { formatCnpj } from "./formatters";
import type { FornecedoresFilter, FornecedorRanking } from "./types";
import { ALERTA_THRESHOLD } from "./types";

export function filterFornecedores(
  lista: FornecedorRanking[],
  filter: FornecedoresFilter,
): FornecedorRanking[] {
  return lista.filter((f) => {
    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (!f.nome.toLowerCase().includes(q) && !f.cnpj.includes(q)) return false;
    }
    if (filter.somenteAlerta && f.taxa_aditivo <= ALERTA_THRESHOLD) return false;
    if (filter.risco !== "todos" && getRiscoNivel(f.avg_prob_atraso) !== filter.risco) return false;
    return true;
  });
}

export function hasAlerta(f: FornecedorRanking): boolean {
  return f.taxa_aditivo > ALERTA_THRESHOLD;
}

function escapeField(v: string | number): string {
  const s = String(v);
  return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
}

export function exportFornecedoresCsv(lista: FornecedorRanking[]): void {
  const headers = [
    "CNPJ",
    "Razão Social",
    "Total Contratos",
    "Total Obras",
    "Valor Total (R$)",
    "Taxa Aditivo %",
    "Risco Médio %",
    "Em Andamento",
    "Concluídas",
  ];
  const rows = lista.map((f) => [
    formatCnpj(f.cnpj),
    f.nome,
    f.total_contratos,
    f.total_obras,
    f.valor_total.toFixed(2),
    (f.taxa_aditivo * 100).toFixed(1),
    (f.avg_prob_atraso * 100).toFixed(1),
    f.obras_em_andamento,
    f.obras_concluidas,
  ]);
  const csv = [headers, ...rows].map((r) => r.map(escapeField).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fornecedores_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

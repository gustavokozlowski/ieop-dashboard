import type { Period } from "../features/dashboard/types";
import type { DistribuicaoItem, StatusCount } from "../schemas/dashboard.schema";
import {
  type DashboardSummary,
  dashboardMetricsRawSchema,
  distribuicaoItemSchema,
  evolucaoMesSchema,
  type Obra,
} from "../schemas/dashboard.schema";
import { type IEOPStats, ieopStatsSchema } from "../schemas/ieop.schema";
import { obrasPageSchema, situacaoToStatus } from "../schemas/obras.schema";
import { apiClient } from "./api";

// Mapeia o label textual do backend para o enum de status e soma as
// quantidades por status (evita fatias cinza/duplicadas na rosca).
function aggregateStatus(items: DistribuicaoItem[]): StatusCount[] {
  const totals = new Map<string, number>();
  for (const d of items) {
    const status = situacaoToStatus(d.label);
    totals.set(status, (totals.get(status) ?? 0) + d.quantidade);
  }
  return [...totals].map(([status, total]) => ({ status, total }));
}

function periodParams(period?: Period): Record<string, string> {
  if (!period) return {};
  return { data_inicio: period.dataInicio, data_fim: period.dataFim };
}

// Busca tolerante: se o endpoint falhar (ex.: 500 do backend), devolve o
// fallback em vez de derrubar todo o dashboard.
async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

// Monta o DashboardSummary que a UI espera a partir de 4 endpoints do backend.
export async function getDashboard(period?: Period): Promise<DashboardSummary> {
  const params = periodParams(period);

  const [metrics, porStatus, porSecretaria, evolucao] = await Promise.all([
    apiClient
      .get("/api/v1/dashboard/", { params })
      .then((r) => dashboardMetricsRawSchema.parse(r.data)),
    safe(
      apiClient
        .get("/api/v1/dashboard/distribuicao-status")
        .then((r) => distribuicaoItemSchema.array().parse(r.data)),
      [],
    ),
    safe(
      apiClient
        .get("/api/v1/dashboard/distribuicao-secretaria")
        .then((r) => distribuicaoItemSchema.array().parse(r.data)),
      [],
    ),
    safe(
      apiClient
        .get("/api/v1/dashboard/evolucao")
        .then((r) => evolucaoMesSchema.array().parse(r.data)),
      [],
    ),
  ]);

  return {
    total_obras: metrics.total_obras,
    obras_em_andamento: metrics.obras_em_andamento,
    valor_total_contratado: metrics.valor_total,
    media_execucao: metrics.media_execucao_pct,
    // O backend rotula por texto ("Em andamento", "Indefinido"…); mapeamos para
    // o enum e agregamos para a rosca colorir e não duplicar fatias.
    por_status: aggregateStatus(porStatus),
    por_secretaria: porSecretaria.map((d) => ({ secretaria: d.label, total: d.quantidade })),
    evolucao_mensal: evolucao,
  };
}

// Top obras em alerta. O endpoint dedicado (/dashboard/alertas) retorna 500
// hoje, então derivamos da lista de obras ordenada por prob_atraso desc.
export async function getTopAlerts(period?: Period, limit = 5): Promise<Obra[]> {
  const page = obrasPageSchema.parse(
    (
      await apiClient.get("/api/v1/obras/", {
        params: { ...periodParams(period), sort: "-prob_atraso", limit },
      })
    ).data,
  );

  return page.items.map((r) => ({
    id: r.id,
    nome: r.nome,
    secretaria: r.secretaria ?? "Não informado",
    status: situacaoToStatus(r.situacao),
    prob_atraso: r.prob_atraso ?? 0,
    valor_contratado: r.valor_contrato ?? 0,
    execucao_percentual: r.percentual_executado ?? 0,
  }));
}

export async function getIEOPStats(): Promise<IEOPStats> {
  const { data } = await apiClient.get("/api/v1/dashboard/ieop");
  return ieopStatsSchema.parse(data);
}

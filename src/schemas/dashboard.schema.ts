import { z } from "zod";
import { obraStatusSchema } from "./obras.schema";

export const statusCountSchema = z.object({
  status: z.string(), // ObraStatus, mas tolerante a valores não previstos
  total: z.number(),
});

export const secretariaCountSchema = z.object({
  secretaria: z.string(),
  total: z.number(),
});

export const evolucaoMesSchema = z.object({
  mes: z.string(), // "2025-01"
  iniciadas: z.number(),
  concluidas: z.number(),
});

export const dashboardSummarySchema = z.object({
  total_obras: z.number(),
  obras_em_andamento: z.number(),
  valor_total_contratado: z.number(),
  media_execucao: z.number(),
  por_status: statusCountSchema.array(),
  por_secretaria: secretariaCountSchema.array(),
  evolucao_mensal: evolucaoMesSchema.array(),
});

// Obra resumida usada no card de alertas (top prob_atraso)
export const obraSchema = z.object({
  id: z.string(),
  nome: z.string(),
  secretaria: z.string(),
  status: obraStatusSchema,
  prob_atraso: z.number(),
  valor_contratado: z.number(),
  execucao_percentual: z.number(),
});

export type StatusCount = z.infer<typeof statusCountSchema>;
export type SecretariaCount = z.infer<typeof secretariaCountSchema>;
export type EvolucaoMes = z.infer<typeof evolucaoMesSchema>;
export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;
export type Obra = z.infer<typeof obraSchema>;

// ── Contrato REAL do backend (DUOPEN 2026) ────────────────────────
// O resumo da UI é montado a partir de VÁRIOS endpoints:
//   /dashboard/                   → métricas globais (nomes diferentes)
//   /dashboard/distribuicao-status      → por_status
//   /dashboard/distribuicao-secretaria  → por_secretaria
//   /dashboard/evolucao           → evolucao_mensal
// Os schemas raw validam cada um; os adapters convertem para o shape da UI.

export const dashboardMetricsRawSchema = z
  .object({
    total_obras: z.number(),
    valor_total: z.number(),
    media_execucao_pct: z.number(),
    obras_em_andamento: z.number(),
    obras_concluidas: z.number(),
    obras_atrasadas: z.number(),
  })
  .catchall(z.unknown());

// Itens de distribuição vêm como { label, quantidade, valor_total }.
export const distribuicaoItemSchema = z
  .object({
    label: z.string(),
    quantidade: z.number(),
    valor_total: z.number().nullable().optional(),
  })
  .catchall(z.unknown());

export type DashboardMetricsRaw = z.infer<typeof dashboardMetricsRawSchema>;
export type DistribuicaoItem = z.infer<typeof distribuicaoItemSchema>;

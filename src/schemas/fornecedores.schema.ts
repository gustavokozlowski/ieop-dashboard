import { z } from "zod";
import { obraStatusSchema, pageSchema, situacaoToStatus } from "./obras.schema";

// ── Ranking (/api/v1/fornecedores) ────────────────────────────────
export const fornecedorRankingSchema = z
  .object({
    id: z.string(),
    nome: z.string(),
    cnpj: z.string(),
    total_contratos: z.number(),
    total_obras: z.number(),
    valor_total: z.number(),
    taxa_aditivo: z.number(),
    avg_prob_atraso: z.number(),
    obras_em_andamento: z.number(),
    obras_concluidas: z.number(),
  })
  .catchall(z.unknown());

export type FornecedorRanking = z.infer<typeof fornecedorRankingSchema>;

// ── Perfil (/api/v1/fornecedores/:id) ─────────────────────────────
export const obraHistoricoSchema = z
  .object({
    id: z.string(),
    nome: z.string(),
    secretaria: z.string(),
    status: obraStatusSchema,
    valor_contratado: z.number(),
    execucao_percentual: z.number(),
    prob_atraso: z.number(),
    data_inicio: z.string(),
    previsao_termino: z.string(),
  })
  .catchall(z.unknown());

export const valorPorAnoSchema = z.object({
  ano: z.number(),
  valor: z.number(),
  n_obras: z.number(),
});

export const evolucaoRiscoSchema = z.object({
  periodo: z.string(), // "YYYY-MM"
  avg_prob_atraso: z.number(),
});

export const fornecedorPerfilSchema = z.object({
  id: z.string(),
  nome: z.string(),
  cnpj: z.string(),
  email: z.string().optional(),
  telefone: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  taxa_aditivo: z.number(),
  avg_prob_atraso: z.number(),
  total_contratos: z.number(),
  valor_total: z.number(),
  obras: obraHistoricoSchema.array(),
  valor_por_ano: valorPorAnoSchema.array(),
  evolucao_risco: evolucaoRiscoSchema.array(),
});

export type ObraHistorico = z.infer<typeof obraHistoricoSchema>;
export type ValorPorAno = z.infer<typeof valorPorAnoSchema>;
export type EvolucaoRisco = z.infer<typeof evolucaoRiscoSchema>;
export type FornecedorPerfil = z.infer<typeof fornecedorPerfilSchema>;

// ── Contrato REAL do backend (DUOPEN 2026) ────────────────────────
// Ranking e perfil retornam o MESMO objeto plano; sem `id` (usamos o cnpj)
// e com `media_prob_atraso` no lugar de `avg_prob_atraso`. O histórico de
// obras vem de um endpoint separado (/{cnpj}/obras); valor_por_ano e
// evolucao_risco não existem no backend → ficam vazios.

export const fornecedorRawSchema = z
  .object({
    cnpj: z.string(),
    nome: z.string(),
    total_contratos: z.number(),
    valor_total: z.number(),
    taxa_aditivo: z.number().nullable().optional(),
    media_prob_atraso: z.number().nullable().optional(),
    obras_concluidas: z.number().nullable().optional(),
    obras_em_andamento: z.number().nullable().optional(),
  })
  .catchall(z.unknown());

export type FornecedorRaw = z.infer<typeof fornecedorRawSchema>;

export const fornecedoresPageSchema = pageSchema(fornecedorRawSchema);

export function adaptFornecedorRanking(r: FornecedorRaw): FornecedorRanking {
  return {
    id: r.cnpj, // backend não tem id próprio; o cnpj identifica o fornecedor
    nome: r.nome,
    cnpj: r.cnpj,
    total_contratos: r.total_contratos,
    total_obras: r.total_contratos,
    valor_total: r.valor_total,
    taxa_aditivo: r.taxa_aditivo ?? 0,
    avg_prob_atraso: r.media_prob_atraso ?? 0,
    obras_em_andamento: r.obras_em_andamento ?? 0,
    obras_concluidas: r.obras_concluidas ?? 0,
  };
}

// Item de /api/v1/fornecedores/{cnpj}/obras (contrato + obra vinculada).
export const fornecedorObraRawSchema = z
  .object({
    id: z.string(),
    id_obra: z.string().nullable().optional(),
    numero: z.string().nullable().optional(),
    objeto: z.string().nullable().optional(),
    situacao: z.string().nullable().optional(),
    valor_global: z.number().nullable().optional(),
    valor_final: z.number().nullable().optional(),
  })
  .catchall(z.unknown());

export type FornecedorObraRaw = z.infer<typeof fornecedorObraRawSchema>;

function adaptObraHistorico(r: FornecedorObraRaw): ObraHistorico {
  return {
    id: r.id_obra ?? r.id,
    nome: r.objeto ?? "—",
    secretaria: "—", // não fornecido neste endpoint
    status: situacaoToStatus(r.situacao),
    valor_contratado: r.valor_final ?? r.valor_global ?? 0,
    execucao_percentual: 0,
    prob_atraso: 0,
    data_inicio: "",
    previsao_termino: "",
  };
}

export function adaptFornecedorPerfil(detalhe: unknown, obras: unknown): FornecedorPerfil {
  const f = fornecedorRawSchema.parse(detalhe);
  const lista = fornecedorObraRawSchema.array().parse(obras);
  return {
    id: f.cnpj,
    nome: f.nome,
    cnpj: f.cnpj,
    taxa_aditivo: f.taxa_aditivo ?? 0,
    avg_prob_atraso: f.media_prob_atraso ?? 0,
    total_contratos: f.total_contratos,
    valor_total: f.valor_total,
    obras: lista.map(adaptObraHistorico),
    valor_por_ano: [], // não disponível no backend
    evolucao_risco: [], // não disponível no backend
  };
}

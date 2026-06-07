import { z } from "zod";
import { ieopFieldsSchema } from "./ieop.schema";
import { obraStatusSchema, situacaoToStatus } from "./obras.schema";

export const aditivoTipoSchema = z.enum(["prazo", "valor", "ambos"]);

export const aditivoSchema = z.object({
  id: z.string(),
  numero: z.string(),
  tipo: aditivoTipoSchema,
  valor: z.number(),
  prazo_dias: z.number(),
  data: z.string(),
  motivo: z.string(),
});

export const contratoVinculadoSchema = z.object({
  id: z.string(),
  numero: z.string(),
  objeto: z.string(),
  valor_inicial: z.number(),
  data_inicio: z.string(),
  data_termino: z.string(),
  aditivos: aditivoSchema.array(),
});

export const fornecedorSchema = z.object({
  id: z.string(),
  nome: z.string(),
  cnpj: z.string(),
  email: z.string().optional(),
  telefone: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
});

export const predicaoMLSchema = z.object({
  prob_atraso: z.number(),
  prob_estouro: z.number(),
  ultima_atualizacao: z.string(),
  fatores_risco: z.string().array(),
});

export const obraDetalheSchema = z.object({
  id: z.string(),
  nome: z.string(),
  numero_contrato: z.string(),
  secretaria: z.string(),
  bairro: z.string(),
  endereco: z.string(),
  status: obraStatusSchema,
  execucao_percentual: z.number(),
  valor_contratado: z.number(),
  valor_aditivos: z.number(),
  data_inicio: z.string(),
  previsao_termino: z.string(),
  atraso_dias: z.number(),
  lat: z.number(),
  lng: z.number(),
  predicao: predicaoMLSchema,
  contratos: contratoVinculadoSchema.array(),
  fornecedor: fornecedorSchema,
  // Índice de Eficiência da Obra Pública (score + classe + componentes C/P/R/E).
  ...ieopFieldsSchema.shape,
});

export type Aditivo = z.infer<typeof aditivoSchema>;
export type ContratoVinculado = z.infer<typeof contratoVinculadoSchema>;
export type Fornecedor = z.infer<typeof fornecedorSchema>;
export type PredicaoML = z.infer<typeof predicaoMLSchema>;
export type ObraDetalhe = z.infer<typeof obraDetalheSchema>;

// ── Contrato REAL do backend (DUOPEN 2026) ────────────────────────
// GET /api/v1/obras/{id} devolve um objeto PLANO (sem predicao/contratos/
// fornecedor aninhados). Predição ML, contratos e dados do fornecedor moram
// em endpoints separados; aqui preenchemos o que existe e deixamos o resto
// com defaults seguros para a página não quebrar.
//
// ⚠️ Hoje este endpoint retorna 500 no backend para toda obra — o adapter
// já está pronto para quando isso for corrigido.

export const obraDetalheRawSchema = z
  .object({
    id: z.string(),
    nome: z.string(),
    descricao: z.string().nullable().optional(),
    num_contrato: z.string().nullable().optional(),
    secretaria: z.string().nullable().optional(),
    bairro: z.string().nullable().optional(),
    municipio: z.string().nullable().optional(),
    // O backend manda o status textual no campo `situacao` (igual à lista);
    // `status` é mantido como fallback defensivo caso o contrato mude.
    situacao: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    nivel_risco: z.string().nullable().optional(),
    valor_contrato: z.number().nullable().optional(),
    data_inicio: z.string().nullable().optional(),
    data_prevista_fim: z.string().nullable().optional(),
    percentual_executado: z.number().nullable().optional(),
    percentual_executado_financeiro: z.number().nullable().optional(),
    prob_atraso: z.number().nullable().optional(),
    prob_estouro: z.number().nullable().optional(),
    dias_atraso: z.number().nullable().optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    cnpj_executora: z.string().nullable().optional(),
    ...ieopFieldsSchema.shape,
  })
  .catchall(z.unknown());

export type ObraDetalheRaw = z.infer<typeof obraDetalheRawSchema>;

export function adaptObraDetalhe(data: unknown): ObraDetalhe {
  const r = obraDetalheRawSchema.parse(data);
  const endereco = [r.bairro, r.municipio].filter(Boolean).join(", ") || "—";
  return {
    id: r.id,
    nome: r.nome,
    numero_contrato: r.num_contrato ?? "—",
    secretaria: r.secretaria ?? "Não informado",
    bairro: r.bairro ?? "—",
    endereco,
    status: situacaoToStatus(r.situacao ?? r.status),
    execucao_percentual: r.percentual_executado ?? r.percentual_executado_financeiro ?? 0,
    valor_contratado: r.valor_contrato ?? 0,
    valor_aditivos: 0,
    data_inicio: r.data_inicio ?? "",
    previsao_termino: r.data_prevista_fim ?? "",
    atraso_dias: r.dias_atraso ?? 0,
    lat: r.latitude ?? 0,
    lng: r.longitude ?? 0,
    predicao: {
      prob_atraso: r.prob_atraso ?? 0,
      prob_estouro: r.prob_estouro ?? 0,
      ultima_atualizacao: r.ieop_calculado_em ?? "",
      fatores_risco: [],
    },
    contratos: [],
    fornecedor: {
      id: r.cnpj_executora ?? "",
      nome: "—",
      cnpj: r.cnpj_executora ?? "",
    },
    ieop_score: r.ieop_score ?? null,
    ieop_classe: r.ieop_classe ?? null,
    ieop_custo: r.ieop_custo ?? null,
    ieop_atraso: r.ieop_atraso ?? null,
    ieop_recorrencia: r.ieop_recorrencia ?? null,
    ieop_execucao: r.ieop_execucao ?? null,
    ieop_calculado_em: r.ieop_calculado_em ?? null,
  };
}

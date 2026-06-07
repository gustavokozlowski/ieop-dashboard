import { z } from "zod";
import { ieopFieldsSchema } from "./ieop.schema";

// ── Enums espelham exatamente os valores que a API retorna ────────
// Fonte única de verdade: reutilizados tanto na validação dos
// formulários de filtro quanto nos tipos das respostas da API.

export const obraStatusSchema = z.enum([
  "em_andamento",
  "concluida",
  "paralisada",
  "atrasada",
  "nao_iniciada",
  "cancelada",
]);
export type ObraStatus = z.infer<typeof obraStatusSchema>;

export const riscoNivelSchema = z.enum(["baixo", "medio", "alto"]);
export type RiscoNivel = z.infer<typeof riscoNivelSchema>;

// ── Resposta da API: item da lista de obras ───────────────────────
// Validado em runtime no serviço. .catchall(unknown) tolera campos extras
// do backend e preserva a index signature exigida pelo Table<T>.
export const obraListItemSchema = z
  .object({
    id: z.string(),
    nome: z.string(),
    numero_contrato: z.string(),
    secretaria: z.string(),
    bairro: z.string(),
    status: obraStatusSchema,
    execucao_percentual: z.number(),
    valor_contratado: z.number(),
    prob_atraso: z.number(),
    previsao_termino: z.string(),
    ...ieopFieldsSchema.shape, // campos IEOP (defensivos: nullable/optional)
  })
  .catchall(z.unknown());

export type ObraListItem = z.infer<typeof obraListItemSchema>;

// ── Formulário de filtro de obras ─────────────────────────────────
// "todos"/"todas" = sem filtro. O tipo do formulário sai daqui via z.infer.

export const obrasFilterSchema = z.object({
  search: z.string(),
  status: z.union([obraStatusSchema, z.literal("todos")]),
  secretaria: z.string(),
  bairro: z.string(),
  risco: z.union([riscoNivelSchema, z.literal("todos")]),
  periodoInicio: z.string(),
  periodoFim: z.string(),
});

export type ObrasFilterValues = z.infer<typeof obrasFilterSchema>;

export const DEFAULT_OBRAS_FILTER: ObrasFilterValues = {
  search: "",
  status: "todos",
  secretaria: "todas",
  bairro: "todos",
  risco: "todos",
  periodoInicio: "",
  periodoFim: "",
};

// ── Contrato REAL do backend (DUOPEN 2026) ────────────────────────
// O backend usa nomes de campo diferentes dos da UI e envelopa a lista
// em { items, total, page, size, pages }. Estes schemas validam o payload
// cru; os adapters abaixo convertem para os tipos que a UI já consome.

// `situacao` vem como texto legível; mapeamos para o enum interno.
const SITUACAO_TO_STATUS: Record<string, ObraStatus> = {
  "Em andamento": "em_andamento",
  Concluída: "concluida",
  Concluida: "concluida",
  Paralisada: "paralisada",
  "Em fase de planejamento": "nao_iniciada",
  Cancelada: "cancelada",
  Indefinido: "nao_iniciada",
};

export function situacaoToStatus(situacao: string | null | undefined): ObraStatus {
  if (!situacao) return "nao_iniciada";
  return SITUACAO_TO_STATUS[situacao] ?? "nao_iniciada";
}

export const obraRawSchema = z
  .object({
    id: z.string(),
    nome: z.string(),
    num_contrato: z.string().nullable().optional(),
    secretaria: z.string().nullable().optional(),
    bairro: z.string().nullable().optional(),
    situacao: z.string().nullable().optional(),
    nivel_risco: z.string().nullable().optional(),
    valor_contrato: z.number().nullable().optional(),
    data_prevista_fim: z.string().nullable().optional(),
    percentual_executado: z.number().nullable().optional(),
    prob_atraso: z.number().nullable().optional(),
    dias_atraso: z.number().nullable().optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    ...ieopFieldsSchema.shape,
  })
  .catchall(z.unknown());

export type ObraRaw = z.infer<typeof obraRawSchema>;

// Envelope paginado padrão do backend.
export function pageSchema<T extends z.ZodTypeAny>(item: T) {
  return z
    .object({
      items: item.array(),
      total: z.number(),
      page: z.number(),
      size: z.number(),
      pages: z.number(),
    })
    .catchall(z.unknown());
}

export const obrasPageSchema = pageSchema(obraRawSchema);

const BAIRRO_SMALL = new Set(["de", "do", "da", "dos", "das", "e", "y"]);

// O campo `bairro` do backend vem sujo: null, CAIXA ALTA e, às vezes,
// coordenadas vazando ("[-41.78,-22.36]" ou listas). Normaliza para Title
// Case (dedup "AROEIRA"/"Aroeira") e descarta o lixo como "—".
function cleanBairro(raw: string | null | undefined): string {
  if (!raw) return "—";
  const s = raw.trim().replace(/\s+/g, " ");
  if (!s || s.includes("[") || s.includes("]") || /-?\d{1,3}\.\d{3,}/.test(s)) return "—";
  const titled = s
    .toLowerCase()
    .split(" ")
    .map((w, i) => (i > 0 && BAIRRO_SMALL.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
  return titled.replace(/[.…\s]+$/, ""); // remove pontuação/espaço no fim ("Miramar." → "Miramar")
}

export function adaptObra(r: ObraRaw): ObraListItem {
  return {
    id: r.id,
    nome: r.nome,
    numero_contrato: r.num_contrato ?? "—",
    secretaria: r.secretaria ?? "Não informado",
    bairro: cleanBairro(r.bairro),
    status: situacaoToStatus(r.situacao),
    execucao_percentual: r.percentual_executado ?? 0,
    valor_contratado: r.valor_contrato ?? 0,
    prob_atraso: r.prob_atraso ?? 0,
    previsao_termino: r.data_prevista_fim ?? "",
    ieop_score: r.ieop_score ?? null,
    ieop_classe: r.ieop_classe ?? null,
    ieop_custo: r.ieop_custo ?? null,
    ieop_atraso: r.ieop_atraso ?? null,
    ieop_recorrencia: r.ieop_recorrencia ?? null,
    ieop_execucao: r.ieop_execucao ?? null,
    ieop_calculado_em: r.ieop_calculado_em ?? null,
  };
}

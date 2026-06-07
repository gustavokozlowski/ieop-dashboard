import { z } from "zod";

// ── Classe IEOP ───────────────────────────────────────────────────
// Fonte única dos rótulos de classe. Reutilizada nos campos das obras,
// no resumo do dashboard e nos utilitários de cor.
export const ieopClasseSchema = z.enum(["Ótimo", "Bom", "Regular", "Ruim", "Crítico"]);
export type IEOPClasse = z.infer<typeof ieopClasseSchema>;

// ── Campos IEOP anexados a cada obra ──────────────────────────────
// Defensivo: nullable + optional. O cálculo vem do duopen-ml e pode
// ainda não existir para toda obra (ou o backend pode não enviá-los).
export const ieopFieldsSchema = z.object({
  ieop_score: z.number().nullable().optional(),
  ieop_classe: ieopClasseSchema.nullable().optional(),
  ieop_custo: z.number().nullable().optional(), // componente C
  ieop_atraso: z.number().nullable().optional(), // componente P
  ieop_recorrencia: z.number().nullable().optional(), // componente R
  ieop_execucao: z.number().nullable().optional(), // componente E
  ieop_calculado_em: z.string().nullable().optional(),
});
export type IEOPScore = z.infer<typeof ieopFieldsSchema>;

// ── Resumo IEOP do município (GET /api/v1/dashboard/ieop) ─────────
// distribuicao tolerante (z.record por string): o backend pode omitir
// classes sem obras — o componente trata ausência como 0.
export const ieopStatsSchema = z.object({
  media_geral: z.number(),
  classe_geral: ieopClasseSchema,
  distribuicao: z.record(z.string(), z.number()),
  ranking_secretarias: z
    .object({
      secretaria: z.string(),
      media_ieop: z.number(),
    })
    .array(),
  piores_obras: z
    .object({
      id: z.string(),
      nome: z.string(),
      ieop_score: z.number(),
      ieop_classe: ieopClasseSchema,
    })
    .array(),
});
export type IEOPStats = z.infer<typeof ieopStatsSchema>;

import { z } from "zod";
import { ieopClasseSchema, ieopFieldsSchema } from "./ieop.schema";
import { obraStatusSchema, situacaoToStatus } from "./obras.schema";

// Ponto georreferenciado de obra (shape consumido pela UI do mapa).
export const obraMapPointSchema = z.object({
  id: z.string(),
  nome: z.string(),
  secretaria: z.string(),
  status: obraStatusSchema,
  prob_atraso: z.number(),
  execucao_percentual: z.number(),
  fornecedor: z.string(),
  lat: z.number(),
  lng: z.number(),
  valor_contratado: z.number(),
  ...ieopFieldsSchema.shape, // campos IEOP (defensivos: nullable/optional)
});

export type ObraMapPoint = z.infer<typeof obraMapPointSchema>;

// ── Contrato REAL do backend: GeoJSON FeatureCollection ───────────
// GET /api/v1/mapa/ devolve um FeatureCollection com coordinates [lng, lat].
// As properties NÃO trazem prob_atraso/fornecedor/ieop — derivamos o que dá.

export const geoJSONFeatureSchema = z
  .object({
    geometry: z.object({ coordinates: z.number().array() }).catchall(z.unknown()),
    properties: z
      .object({
        id: z.string(),
        nome: z.string(),
        status: z.string().nullable().optional(),
        nivel_risco: z.string().nullable().optional(),
        secretaria: z.string().nullable().optional(),
        bairro: z.string().nullable().optional(),
        valor_contrato: z.number().nullable().optional(),
        percentual_executado: z.number().nullable().optional(),
        prob_atraso: z.number().nullable().optional(),
        ieop_score: z.number().nullable().optional(),
        ieop_classe: ieopClasseSchema.nullable().optional(),
      })
      .catchall(z.unknown()),
  })
  .catchall(z.unknown());

export const geoJSONFeatureCollectionSchema = z
  .object({ features: geoJSONFeatureSchema.array() })
  .catchall(z.unknown());

// O mapa precisa de prob_atraso para o nível de risco; o backend só manda
// nivel_risco. Reconstituímos um prob_atraso representativo por faixa.
const RISCO_TO_PROB: Record<string, number> = { alto: 0.85, medio: 0.5, baixo: 0.15 };

export function adaptGeoJSON(data: unknown): ObraMapPoint[] {
  const fc = geoJSONFeatureCollectionSchema.parse(data);
  return fc.features
    .filter((f) => f.geometry.coordinates.length >= 2)
    .map((f) => {
      const p = f.properties;
      const [lng, lat] = f.geometry.coordinates as [number, number];
      return {
        id: p.id,
        nome: p.nome,
        secretaria: p.secretaria ?? "Não informado",
        status: situacaoToStatus(p.status),
        // prob_atraso real quando disponível; senão reconstitui pela faixa de risco.
        prob_atraso: p.prob_atraso ?? (p.nivel_risco ? (RISCO_TO_PROB[p.nivel_risco] ?? 0) : 0),
        execucao_percentual: p.percentual_executado ?? 0,
        fornecedor: "", // não fornecido pelo GeoJSON
        lat,
        lng,
        valor_contratado: p.valor_contrato ?? 0,
        ieop_score: p.ieop_score ?? null,
        ieop_classe: p.ieop_classe ?? null,
      };
    });
}

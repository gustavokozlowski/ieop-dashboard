import type { ObraStatus } from "../features/dashboard/types";
import type { RiscoNivel } from "../features/mapa/types";
import { adaptGeoJSON, type ObraMapPoint } from "../schemas/mapa.schema";
import { apiClient } from "./api";

export interface GeoJSONFilter {
  secretaria?: string;
  status?: ObraStatus;
  risco?: RiscoNivel;
}

// GET /api/v1/mapa/ → GeoJSON FeatureCollection, normalizado para ObraMapPoint[].
export async function getGeoJSON(filter?: GeoJSONFilter): Promise<ObraMapPoint[]> {
  const params: Record<string, string> = {};
  if (filter?.secretaria) params.secretaria = filter.secretaria;
  if (filter?.status) params.status = filter.status;
  if (filter?.risco) params.nivel_risco = filter.risco;

  const { data } = await apiClient.get("/api/v1/mapa/", { params });
  return adaptGeoJSON(data);
}

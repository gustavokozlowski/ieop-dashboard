import type { ObraMapPoint } from "../../schemas/mapa.schema";
import type { RiscoNivel } from "../../schemas/obras.schema";
import type { ObraStatus } from "../dashboard/types";

// ObraMapPoint inferido do schema Zod (validado em runtime no hook).
export type { ObraMapPoint, RiscoNivel };

export interface MapFilter {
  risco: RiscoNivel | "todos";
  secretaria: string; // "todas" or secretaria name
  status: ObraStatus | "todos";
}

export const RISCO_COLORS: Record<RiscoNivel, string> = {
  baixo: "#1D9E75",
  medio: "#BA7517",
  alto: "#A32D2D",
};

export const RISCO_LABELS: Record<RiscoNivel, string> = {
  baixo: "Baixo risco",
  medio: "Médio risco",
  alto: "Alto risco",
};

export const STATUS_LABELS: Record<ObraStatus, string> = {
  em_andamento: "Em andamento",
  concluida: "Concluída",
  paralisada: "Paralisada",
  atrasada: "Atrasada",
  nao_iniciada: "Não iniciada",
  cancelada: "Cancelada",
};

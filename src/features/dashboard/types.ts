// Fonte única: enums e tipos de resposta vivem nos schemas Zod.

import type {
  DashboardSummary,
  EvolucaoMes,
  Obra,
  SecretariaCount,
  StatusCount,
} from "../../schemas/dashboard.schema";
import type { ObraStatus } from "../../schemas/obras.schema";

export type { DashboardSummary, EvolucaoMes, Obra, ObraStatus, SecretariaCount, StatusCount };

// Period é estado de UI (filtro), não resposta da API.
export interface Period {
  dataInicio: string; // YYYY-MM-DD
  dataFim: string;
}

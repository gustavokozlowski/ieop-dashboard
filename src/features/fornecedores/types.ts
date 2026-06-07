import type { FornecedorRanking } from "../../schemas/fornecedores.schema";
import type { RiscoNivel } from "../mapa/types";

// FornecedorRanking inferido do schema Zod (validado em runtime no serviço).
export type { FornecedorRanking, RiscoNivel };

export interface FornecedoresFilter {
  search: string;
  somenteAlerta: boolean; // taxa_aditivo > 0.30
  risco: RiscoNivel | "todos";
}

export const DEFAULT_FILTER: FornecedoresFilter = {
  search: "",
  somenteAlerta: false,
  risco: "todos",
};

export const ALERTA_THRESHOLD = 0.3;

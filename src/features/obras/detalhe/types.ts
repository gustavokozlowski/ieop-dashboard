// Tipos inferidos do schema Zod (validados em runtime no serviço getObraById).
import type {
  Aditivo,
  ContratoVinculado,
  Fornecedor,
  ObraDetalhe,
  PredicaoML,
} from "../../../schemas/obraDetalhe.schema";
import type { ObraStatus } from "../../dashboard/types";

export type { Aditivo, ContratoVinculado, Fornecedor, ObraDetalhe, ObraStatus, PredicaoML };

export const ADITIVO_TIPO_LABELS: Record<Aditivo["tipo"], string> = {
  prazo: "Prazo",
  valor: "Valor",
  ambos: "Prazo e Valor",
};

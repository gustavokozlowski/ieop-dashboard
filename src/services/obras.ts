import { adaptObraDetalhe, type ObraDetalhe } from "../schemas/obraDetalhe.schema";
import { adaptObra, type ObraListItem, obrasPageSchema } from "../schemas/obras.schema";
import { apiClient } from "./api";

const PAGE_SIZE = 100; // máximo aceito pelo backend

// Lista todas as obras. O backend pagina (size ≤ 100): buscamos a primeira
// página, descobrimos o total e trazemos o resto em paralelo. Cada item é
// normalizado para o shape que a UI consome (adaptObra).
export async function getObras(): Promise<ObraListItem[]> {
  const first = obrasPageSchema.parse(
    (await apiClient.get("/api/v1/obras/", { params: { size: PAGE_SIZE, page: 1 } })).data,
  );

  const rest = await Promise.all(
    Array.from({ length: Math.max(0, first.pages - 1) }, (_, i) =>
      apiClient
        .get("/api/v1/obras/", { params: { size: PAGE_SIZE, page: i + 2 } })
        .then((res) => obrasPageSchema.parse(res.data).items),
    ),
  );

  return [first.items, ...rest].flat().map(adaptObra);
}

export async function getObraById(id: string): Promise<ObraDetalhe> {
  const { data } = await apiClient.get(`/api/v1/obras/${id}`);
  return adaptObraDetalhe(data);
}

import {
  adaptFornecedorPerfil,
  adaptFornecedorRanking,
  type FornecedorPerfil,
  type FornecedorRanking,
  fornecedoresPageSchema,
} from "../schemas/fornecedores.schema";
import { apiClient } from "./api";

const PAGE_SIZE = 100; // máximo aceito pelo backend

// Ranking de fornecedores — backend pagina (size ≤ 100); buscamos tudo.
export async function getFornecedores(): Promise<FornecedorRanking[]> {
  const first = fornecedoresPageSchema.parse(
    (await apiClient.get("/api/v1/fornecedores/", { params: { size: PAGE_SIZE, page: 1 } })).data,
  );

  const rest = await Promise.all(
    Array.from({ length: Math.max(0, first.pages - 1) }, (_, i) =>
      apiClient
        .get("/api/v1/fornecedores/", { params: { size: PAGE_SIZE, page: i + 2 } })
        .then((res) => fornecedoresPageSchema.parse(res.data).items),
    ),
  );

  return [first.items, ...rest].flat().map(adaptFornecedorRanking);
}

// Perfil — compõe o objeto base (/{cnpj}) com o histórico de obras
// (/{cnpj}/obras). `id` aqui é o CNPJ (ver adaptFornecedorRanking).
export async function getFornecedorById(cnpj: string): Promise<FornecedorPerfil> {
  const clean = cnpj.replace(/\D/g, "");
  const [detalhe, obras] = await Promise.all([
    apiClient.get(`/api/v1/fornecedores/${clean}`).then((r) => r.data),
    apiClient
      .get(`/api/v1/fornecedores/${clean}/obras`)
      .then((r) => r.data)
      .catch(() => []),
  ]);
  return adaptFornecedorPerfil(detalhe, obras);
}

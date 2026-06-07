import { useQuery } from "@tanstack/react-query";
import { getFornecedorById } from "../../../services/fornecedores";

export function useFornecedorPerfil(id: string) {
  return useQuery({
    queryKey: ["/api/v1/fornecedores", id],
    queryFn: () => getFornecedorById(id),
    enabled: Boolean(id),
    staleTime: 5 * 60_000,
  });
}

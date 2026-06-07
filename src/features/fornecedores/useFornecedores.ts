import { useQuery } from "@tanstack/react-query";
import { getFornecedores } from "../../services/fornecedores";

export function useFornecedores() {
  return useQuery({
    queryKey: ["/api/v1/fornecedores"],
    queryFn: getFornecedores,
    staleTime: 5 * 60_000,
  });
}

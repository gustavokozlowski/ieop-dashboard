import { useQuery } from "@tanstack/react-query";
import { getObras } from "../../services/obras";

export function useObras() {
  // Usa o serviço (que valida o payload com Zod) em vez de bater direto no endpoint.
  return useQuery({
    queryKey: ["/api/v1/obras"],
    queryFn: getObras,
    staleTime: 5 * 60_000,
  });
}

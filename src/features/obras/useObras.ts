import { useQuery } from "@tanstack/react-query";
import { getObras, getObrasTotal } from "../../services/obras";

export function useObras() {
  // Usa o serviço (que valida o payload com Zod) em vez de bater direto no endpoint.
  return useQuery({
    queryKey: ["/api/v1/obras"],
    queryFn: getObras,
    staleTime: 5 * 60_000,
  });
}

// Apenas o total (request mínimo), para o badge da navegação. Defensivo:
// falha isolada, sem retry — a navegação renderiza sem o contador.
export function useObrasTotal() {
  return useQuery({
    queryKey: ["/api/v1/obras", "total"],
    queryFn: getObrasTotal,
    staleTime: 5 * 60_000,
    retry: false,
  });
}

import { useQuery } from "@tanstack/react-query";
import { getObraById } from "../../../services/obras";

export function useObraDetalhe(id: string) {
  return useQuery({
    queryKey: ["/api/v1/obras", id],
    queryFn: () => getObraById(id),
    enabled: Boolean(id),
    staleTime: 5 * 60_000,
  });
}

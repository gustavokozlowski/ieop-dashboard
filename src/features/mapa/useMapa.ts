import { useQuery } from "@tanstack/react-query";
import { getGeoJSON } from "../../services/mapa";

const REFETCH_MS = 5 * 60 * 1000;

export function useMapaObras() {
  return useQuery({
    queryKey: ["/api/v1/mapa"],
    queryFn: () => getGeoJSON(),
    refetchInterval: REFETCH_MS,
    staleTime: REFETCH_MS,
  });
}

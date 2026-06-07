/**
 * Hooks TanStack Query que delegam chamadas HTTP ao apiClient de services/api.
 * staleTime padrão: 5 minutos (configurado também no QueryClient em frontend.tsx).
 */

import type { UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/api";

// Re-export so existing imports from hooks/useApi keep working
export { apiClient } from "../services/api";

const STALE = 5 * 60_000; // 5 minutes

// ── GET ──────────────────────────────────────────────────────────
export function useApi<T>(
  endpoint: string,
  options?: Omit<UseQueryOptions<T, Error>, "queryKey" | "queryFn">,
) {
  return useQuery<T, Error>({
    queryKey: [endpoint],
    queryFn: () => apiClient.get<T>(endpoint).then((r) => r.data),
    staleTime: STALE,
    ...options,
  });
}

// ── POST / PUT / PATCH / DELETE ──────────────────────────────────
interface MutationArgs {
  method?: "POST" | "PUT" | "PATCH" | "DELETE";
  endpoint: string;
  invalidates?: string[];
}

export function useApiMutation<TData = unknown, TBody = unknown>(
  { method = "POST", endpoint, invalidates = [] }: MutationArgs,
  options?: UseMutationOptions<TData, Error, TBody>,
) {
  const qc = useQueryClient();

  return useMutation<TData, Error, TBody>({
    mutationFn: (body) =>
      apiClient.request<TData>({ method, url: endpoint, data: body }).then((r) => r.data),
    onSuccess: (...args) => {
      invalidates.forEach((key) => qc.invalidateQueries({ queryKey: [key] }));
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

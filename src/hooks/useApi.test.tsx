import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { apiClient } from "../services/api";
import { useApi } from "./useApi";

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

afterEach(() => {
  // restaura spies entre os testes
  (apiClient.get as unknown as { mockRestore?: () => void }).mockRestore?.();
});

describe("useApi", () => {
  it("busca e retorna os dados do endpoint", async () => {
    const payload = [{ id: "1", nome: "Obra" }];
    const getSpy = spyOn(apiClient, "get").mockResolvedValue({ data: payload } as never);

    const { result } = renderHook(() => useApi<typeof payload>("/api/v1/obras"), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(payload);
    expect(getSpy).toHaveBeenCalledWith("/api/v1/obras");
  });

  it("expõe estado de erro quando a requisição falha", async () => {
    spyOn(apiClient, "get").mockRejectedValue(new Error("falhou") as never);

    const { result } = renderHook(() => useApi("/api/v1/dashboard"), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("falhou");
  });
});

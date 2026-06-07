import { useQuery } from "@tanstack/react-query";
import { getDashboard, getIEOPStats, getTopAlerts } from "../../services/dashboard";
import type { Period } from "./types";

const REFETCH_MS = 5 * 60 * 1000; // 5 minutes

export function useDashboardSummary(period: Period) {
  return useQuery({
    queryKey: ["dashboard-summary", period.dataInicio, period.dataFim],
    queryFn: () => getDashboard(period),
    refetchInterval: REFETCH_MS,
    staleTime: REFETCH_MS,
  });
}

export function useTopAlerts(period: Period) {
  return useQuery({
    queryKey: ["dashboard-alertas", period.dataInicio, period.dataFim],
    queryFn: () => getTopAlerts(period),
    refetchInterval: REFETCH_MS,
    staleTime: REFETCH_MS,
  });
}

// Resumo IEOP do município. Defensivo: o endpoint pode ainda não existir;
// a query falha de forma isolada e o Dashboard só renderiza quando há dados.
export function useIEOPStats() {
  return useQuery({
    queryKey: ["/api/v1/dashboard/ieop"],
    queryFn: getIEOPStats,
    refetchInterval: REFETCH_MS,
    staleTime: REFETCH_MS,
    retry: false,
  });
}

export function defaultPeriod(): Period {
  const fim = new Date();
  const inicio = new Date(fim);
  inicio.setDate(inicio.getDate() - 30);
  return {
    dataInicio: inicio.toISOString().slice(0, 10),
    dataFim: fim.toISOString().slice(0, 10),
  };
}

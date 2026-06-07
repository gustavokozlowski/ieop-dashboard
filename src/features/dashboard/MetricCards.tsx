import { Card } from "../../components/Card";
import { ActivityIcon, BuildingIcon, GaugeIcon, MoneyIcon } from "../../components/icons";
import { formatBRL, formatPct } from "./formatters";
import { CardSkeleton } from "./Skeleton";
import type { DashboardSummary } from "./types";

export interface MetricDeltas {
  totalObras?: number;
  emAndamento?: number;
  valor?: number;
  execucao?: number;
}

interface MetricCardsProps {
  data: DashboardSummary | undefined;
  isLoading: boolean;
  /** Variação % vs. período anterior (calculada no Dashboard). */
  deltas?: MetricDeltas;
}

export function MetricCards({ data, isLoading, deltas }: MetricCardsProps) {
  if (isLoading || !data) {
    return (
      <>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </>
    );
  }

  return (
    <>
      <Card
        title="Total de obras"
        value={data.total_obras.toLocaleString("pt-BR")}
        icon={<BuildingIcon />}
        trend={deltas?.totalObras}
        trendLabel="vs. período anterior"
      />
      <Card
        title="Em andamento"
        value={data.obras_em_andamento.toLocaleString("pt-BR")}
        icon={<ActivityIcon />}
        variant="success"
        trend={deltas?.emAndamento}
        trendLabel="vs. período anterior"
      />
      <Card
        title="Valor contratado"
        value={formatBRL(data.valor_total_contratado)}
        icon={<MoneyIcon />}
        variant="warning"
        trend={deltas?.valor}
        trendLabel="vs. período anterior"
      />
      <Card
        title="Média de execução"
        value={formatPct(data.media_execucao)}
        icon={<GaugeIcon />}
        variant={
          data.media_execucao >= 70 ? "success" : data.media_execucao >= 40 ? "warning" : "danger"
        }
        trend={deltas?.execucao}
        trendLabel="vs. período anterior"
      />
    </>
  );
}

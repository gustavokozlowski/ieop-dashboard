import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartSkeleton } from "../../dashboard/Skeleton";
import type { ValorPorAno } from "./types";

const TOOLTIP = {
  contentStyle: {
    background: "#161b27",
    border: "1px solid #2a2f42",
    borderRadius: "8px",
    color: "#e8eaf0",
    fontSize: 13,
  },
  itemStyle: { color: "#8b90a8" },
  labelStyle: { color: "#e8eaf0", fontWeight: 600 },
};

const AXIS = { fill: "#8b90a8", fontSize: 12 };
const GRID = { stroke: "#2a2f42", strokeDasharray: "4 4" };

const brlCompact = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

interface ValorAnualChartProps {
  data: ValorPorAno[] | undefined;
  isLoading?: boolean;
}

export function ValorAnualChart({ data, isLoading }: ValorAnualChartProps) {
  if (isLoading || !data || data.length === 0)
    return <ChartSkeleton title="Valor contratado por ano" />;

  const sorted = [...data].sort((a, b) => a.ano - b.ano);

  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-6)",
      }}
    >
      <p
        style={{
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          color: "var(--color-text-secondary)",
          marginBottom: "var(--space-4)",
        }}
      >
        Valor contratado por ano
      </p>
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={sorted} margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
            <CartesianGrid {...GRID} />
            <XAxis dataKey="ano" tick={AXIS} axisLine={false} tickLine={false} />
            <YAxis
              yAxisId="valor"
              tick={AXIS}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => brlCompact.format(v)}
            />
            <YAxis
              yAxisId="obras"
              orientation="right"
              tick={AXIS}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              {...TOOLTIP}
              formatter={(value: number, name: string) =>
                name === "valor" ? [brlCompact.format(value), "Valor"] : [value, "Obras"]
              }
            />
            <Legend
              formatter={(v) => (
                <span style={{ color: "#8b90a8", fontSize: 12 }}>
                  {v === "valor" ? "Valor contratado" : "Nº de obras"}
                </span>
              )}
            />
            <Bar
              yAxisId="obras"
              dataKey="n_obras"
              name="obras"
              fill="#1e2436"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Line
              yAxisId="valor"
              type="monotone"
              dataKey="valor"
              name="valor"
              stroke="#1D9E75"
              strokeWidth={2}
              dot={{ fill: "#1D9E75", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

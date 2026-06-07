import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMes } from "../../dashboard/formatters";
import { ChartSkeleton } from "../../dashboard/Skeleton";
import type { EvolucaoRisco } from "./types";

const TOOLTIP = {
  contentStyle: {
    background: "#161b27",
    border: "1px solid #2a2f42",
    borderRadius: "8px",
    color: "#e8eaf0",
    fontSize: 13,
  },
  labelStyle: { color: "#e8eaf0", fontWeight: 600 },
};

const AXIS = { fill: "#8b90a8", fontSize: 12 };
const GRID = { stroke: "#2a2f42", strokeDasharray: "4 4" };

interface RiscoEvolutionChartProps {
  data: EvolucaoRisco[] | undefined;
  isLoading?: boolean;
}

export function RiscoEvolutionChart({ data, isLoading }: RiscoEvolutionChartProps) {
  if (isLoading || !data || data.length === 0) return <ChartSkeleton title="Evolução de risco" />;

  const sorted = [...data]
    .sort((a, b) => a.periodo.localeCompare(b.periodo))
    .map((d) => ({ ...d, mes: formatMes(d.periodo) }));

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
        Evolução de risco ao longo do tempo
      </p>
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sorted} margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
            <CartesianGrid {...GRID} />
            <XAxis dataKey="mes" tick={AXIS} axisLine={false} tickLine={false} />
            <YAxis
              tick={AXIS}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
              domain={[0, 1]}
            />
            <Tooltip
              {...TOOLTIP}
              formatter={(v: number) => [`${(v * 100).toFixed(1)}%`, "Prob. atraso"]}
            />
            <ReferenceLine
              y={0.7}
              stroke="#A32D2D"
              strokeDasharray="4 4"
              label={{ value: "70%", fill: "#A32D2D", fontSize: 10 }}
            />
            <ReferenceLine
              y={0.4}
              stroke="#BA7517"
              strokeDasharray="4 4"
              label={{ value: "40%", fill: "#BA7517", fontSize: 10 }}
            />
            <Line
              type="monotone"
              dataKey="avg_prob_atraso"
              name="Prob. atraso"
              stroke="#A32D2D"
              strokeWidth={2}
              dot={{ fill: "#A32D2D", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

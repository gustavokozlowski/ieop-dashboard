import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMes } from "./formatters";
import styles from "./LineChart.module.css";
import { ChartSkeleton } from "./Skeleton";
import type { EvolucaoMes } from "./types";

const TOOLTIP_STYLE = {
  contentStyle: {
    background: "#161b27",
    border: "1px solid #2a2f42",
    borderRadius: "8px",
    color: "#e8eaf0",
    fontSize: 13,
  },
  itemStyle: { color: "#8b90a8" },
  labelStyle: { color: "#e8eaf0", fontWeight: 600 },
  cursor: { stroke: "#2a2f42" },
};

const AXIS = { fill: "#8b90a8", fontSize: 12 };
const GRID = { stroke: "#2a2f42", strokeDasharray: "4 4" };

interface LineChartProps {
  data: EvolucaoMes[] | undefined;
  isLoading: boolean;
}

export function LineChart({ data, isLoading }: LineChartProps) {
  if (isLoading || !data) return <ChartSkeleton title="Evolução mensal" />;

  const formatted = data.map((d) => ({ ...d, mes: formatMes(d.mes) }));

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <span className={styles.title}>Evolução mensal</span>
        <span className={styles.sub}>iniciadas vs. concluídas</span>
      </div>

      <div className={styles.legend}>
        <span className={styles.leg}>
          <i style={{ background: "#3FB984" }} /> Iniciadas
        </span>
        <span className={styles.leg}>
          <i style={{ background: "#8b90a8" }} /> Concluídas
        </span>
      </div>

      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={formatted} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
            <defs>
              <linearGradient id="evoFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3FB984" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#3FB984" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...GRID} />
            <XAxis dataKey="mes" tick={AXIS} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip {...TOOLTIP_STYLE} />
            {/* Iniciadas: linha verde sólida + área */}
            <Area
              type="monotone"
              dataKey="iniciadas"
              name="Iniciadas"
              stroke="#3FB984"
              strokeWidth={2.2}
              strokeLinecap="round"
              fill="url(#evoFill)"
              dot={{ fill: "#3FB984", r: 3 }}
              activeDot={{ r: 5 }}
            />
            {/* Concluídas: linha cinza tracejada */}
            <Line
              type="monotone"
              dataKey="concluidas"
              name="Concluídas"
              stroke="#8b90a8"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={{ fill: "#161b27", stroke: "#8b90a8", strokeWidth: 1.5, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

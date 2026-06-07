import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import styles from "./DonutChart.module.css";
import { ChartSkeleton } from "./Skeleton";
import type { StatusCount } from "./types";

const STATUS_COLORS: Record<string, string> = {
  em_andamento: "#3b82f6",
  concluida: "#1D9E75",
  paralisada: "#BA7517",
  atrasada: "#A32D2D",
  nao_iniciada: "#6b7280",
  cancelada: "#7f1d1d",
};

const STATUS_LABELS: Record<string, string> = {
  em_andamento: "Em andamento",
  concluida: "Concluída",
  paralisada: "Paralisada",
  atrasada: "Atrasada",
  nao_iniciada: "Não iniciada",
  cancelada: "Cancelada",
};

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
};

interface DonutChartProps {
  data: StatusCount[] | undefined;
  isLoading: boolean;
}

export function DonutChart({ data, isLoading }: DonutChartProps) {
  if (isLoading || !data) return <ChartSkeleton title="Obras por status" />;

  // Maior contagem primeiro (espelha o protótipo).
  const formatted = data
    .map((d) => ({
      name: STATUS_LABELS[d.status] ?? d.status,
      value: d.total,
      color: STATUS_COLORS[d.status] ?? "#555b72",
    }))
    .sort((a, b) => b.value - a.value);

  const total = formatted.reduce((s, d) => s + d.value, 0);

  return (
    <div className={styles.card}>
      <p className={styles.title}>Obras por status</p>

      <div className={styles.wrap}>
        <div className={styles.donut}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formatted}
                cx="50%"
                cy="50%"
                innerRadius={66}
                outerRadius={98}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {formatted.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.center}>
            <span className={styles.total}>{total.toLocaleString("pt-BR")}</span>
            <span className={styles.totalLbl}>obras</span>
          </div>
        </div>

        <div className={styles.legend}>
          {formatted.map((d) => (
            <div key={d.name} className={styles.legItem}>
              <span className={styles.dot} style={{ background: d.color }} />
              <span className={styles.name}>{d.name}</span>
              <span className={styles.val}>{d.value.toLocaleString("pt-BR")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

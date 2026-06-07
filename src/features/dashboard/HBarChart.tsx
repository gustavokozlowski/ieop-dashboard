import { normalizeSecretaria } from "./formatters";
import styles from "./HBarChart.module.css";
import { ChartSkeleton } from "./Skeleton";
import type { SecretariaCount } from "./types";

interface HBarChartProps {
  data: SecretariaCount[] | undefined;
  isLoading: boolean;
}

export function HBarChart({ data, isLoading }: HBarChartProps) {
  if (isLoading || !data) return <ChartSkeleton title="Obras por secretaria" />;

  const sorted = [...data].sort((a, b) => b.total - a.total).slice(0, 6);
  const max = Math.max(1, ...sorted.map((s) => s.total));

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <span className={styles.title}>Obras por secretaria</span>
        <span className={styles.sub}>{sorted.length} principais</span>
      </div>

      <div className={styles.bars}>
        {sorted.map((s) => (
          <div key={s.secretaria}>
            <div className={styles.barHead}>
              <span className={styles.name} title={s.secretaria}>
                {normalizeSecretaria(s.secretaria)}
              </span>
              <span className={styles.val}>{s.total.toLocaleString("pt-BR")}</span>
            </div>
            <div className={styles.track}>
              <div className={styles.fill} style={{ width: `${(s.total / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

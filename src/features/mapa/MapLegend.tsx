import styles from "./MapLegend.module.css";
import type { RiscoNivel } from "./types";
import { RISCO_COLORS, RISCO_LABELS } from "./types";

const NIVEIS: RiscoNivel[] = ["baixo", "medio", "alto"];

export function MapLegend() {
  return (
    <div className={styles.legend} aria-label="Legenda de risco">
      <p className={styles.title}>Risco de atraso</p>
      {NIVEIS.map((nivel) => (
        <div key={nivel} className={styles.item}>
          <div className={styles.dot} style={{ background: RISCO_COLORS[nivel] }} />
          {RISCO_LABELS[nivel]}
        </div>
      ))}
    </div>
  );
}

import styles from "./CardPredicaoML.module.css";
import type { PredicaoML } from "./types";

function gaugeColor(prob: number): string {
  if (prob >= 0.7) return "#A32D2D";
  if (prob >= 0.4) return "#BA7517";
  return "#1D9E75";
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// Anel radial (preferido ao semicírculo — ver DESIGN_SYSTEM §6).
function GaugeChart({ value, label }: { value: number; label: string }) {
  const pct = Math.max(0, Math.min(1, value));
  const color = gaugeColor(pct);
  const r = 42;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - pct);

  return (
    <div className={styles.gaugeWrapper}>
      <div className={styles.ring}>
        <svg viewBox="0 0 100 100" role="img" aria-label={`${label}: ${Math.round(pct * 100)}%`}>
          <circle className={styles.ringTrack} cx="50" cy="50" r={r} fill="none" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={off}
            style={{
              filter: `drop-shadow(0 0 5px ${color}66)`,
              transition: "stroke-dashoffset 600ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </svg>
        <div className={styles.ringCenter}>
          <span className={styles.ringPct} style={{ color }}>
            {Math.round(pct * 100)}%
          </span>
        </div>
      </div>
      <p className={styles.gaugeLabel}>{label}</p>
    </div>
  );
}

interface CardPredicaoMLProps {
  predicao: PredicaoML;
}

export function CardPredicaoML({ predicao }: CardPredicaoMLProps) {
  return (
    <div className={styles.card}>
      <p className={styles.title}>Predição ML</p>

      <div className={styles.gauges}>
        <GaugeChart value={predicao.prob_atraso} label="Prob. atraso" />
        <GaugeChart value={predicao.prob_estouro} label="Prob. estouro" />
      </div>

      <p className={styles.updated}>Atualizado em {formatDateTime(predicao.ultima_atualizacao)}</p>

      {predicao.fatores_risco.length > 0 && (
        <>
          <p className={styles.factorsTitle}>Fatores de risco identificados</p>
          <ul className={styles.factorsList}>
            {predicao.fatores_risco.map((f, i) => (
              <li key={i} className={styles.factorItem}>
                <span className={styles.factorDot} aria-hidden />
                {f}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

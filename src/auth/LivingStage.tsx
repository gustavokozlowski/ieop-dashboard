import type { ReactNode } from "react";
import styles from "./authForm.module.css";

// Pontos de obra flutuando, coloridos por classe IEOP.
const DOTS = [
  { x: 12, y: 22, c: "var(--ieop-otimo)", d: 0 },
  { x: 24, y: 64, c: "var(--ieop-bom)", d: 1.1 },
  { x: 38, y: 34, c: "var(--ieop-otimo)", d: 2.0 },
  { x: 46, y: 72, c: "var(--ieop-regular)", d: 0.6 },
  { x: 58, y: 26, c: "var(--ieop-bom)", d: 1.6 },
  { x: 64, y: 58, c: "var(--ieop-ruim)", d: 2.4 },
  { x: 72, y: 38, c: "var(--ieop-otimo)", d: 0.9 },
  { x: 80, y: 70, c: "var(--ieop-critico)", d: 1.4 },
  { x: 86, y: 30, c: "var(--ieop-bom)", d: 2.2 },
  { x: 32, y: 84, c: "var(--ieop-regular)", d: 1.9 },
  { x: 54, y: 88, c: "var(--ieop-otimo)", d: 0.4 },
  { x: 18, y: 46, c: "var(--ieop-ruim)", d: 2.6 },
];

const LEGEND = [
  { c: "var(--ieop-otimo)", n: "Ótimo", v: "412" },
  { c: "var(--ieop-bom)", n: "Bom", v: "638" },
  { c: "var(--ieop-regular)", n: "Regular", v: "291" },
  { c: "var(--ieop-ruim)", n: "Ruim", v: "147" },
  { c: "var(--ieop-critico)", n: "Crítico", v: "73" },
];

/** Painel vivo (esquerda) das telas de autenticação — decorativo. */
export function LivingStage({ headline }: { headline: ReactNode }) {
  return (
    <div className={styles.stage} aria-hidden>
      <div className={styles.glow} />
      <div className={styles.field}>
        {DOTS.map((d, i) => (
          <span
            key={i}
            className={styles.obra}
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              background: d.c,
              color: d.c,
              animationDelay: `${d.d}s`,
            }}
          />
        ))}
      </div>

      <div className={styles.tagline}>Índice de Eficiência de Obras Públicas</div>

      <div className={styles.hero}>
        <div>
          <div className={styles.eyebrow}>Estado do Rio de Janeiro</div>
          <h1 className={styles.headline}>{headline}</h1>
        </div>
        <div className={styles.gaugeRow}>
          <div
            className={styles.gauge}
            style={{
              background:
                "conic-gradient(var(--ieop-bom) 0 73.4%, var(--color-surface2) 73.4% 100%)",
            }}
          >
            <div className={styles.gaugeVal}>
              <div className={styles.gaugeNum}>73,4</div>
              <div className={styles.gaugeLabel}>Bom</div>
            </div>
          </div>
          <div className={styles.legend}>
            {LEGEND.map((l) => (
              <div className={styles.legendItem} key={l.n}>
                <span className={styles.legendDot} style={{ background: l.c }} />
                {l.n} <b>{l.v}</b>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.ticker}>
        <div className={styles.stat}>
          <span className={styles.statNum}>1.561</span>
          <span className={styles.statLbl}>obras monitoradas</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum} style={{ color: "var(--ieop-bom)" }}>
            68,9
          </span>
          <span className={styles.statLbl}>IEOP médio do estado</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum} style={{ color: "var(--color-danger)" }}>
            220
          </span>
          <span className={styles.statLbl}>em risco crítico</span>
        </div>
      </div>
    </div>
  );
}

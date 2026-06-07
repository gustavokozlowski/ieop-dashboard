import { formatBRL } from "../formatters";
import styles from "./CardExecucao.module.css";
import type { ObraDetalhe } from "./types";

function barColor(pct: number): string {
  if (pct >= 70) return "#1D9E75";
  if (pct >= 40) return "#BA7517";
  return "#A32D2D";
}

interface CardExecucaoProps {
  obra: ObraDetalhe;
}

export function CardExecucao({ obra }: CardExecucaoProps) {
  const valorTotal = obra.valor_contratado + obra.valor_aditivos;
  const pct = Math.min(obra.execucao_percentual, 100);

  return (
    <div className={styles.card}>
      <p className={styles.title}>Execução</p>

      <div className={styles.pctRow}>
        <span className={styles.pctValue}>{pct.toFixed(1)}%</span>
        <span className={styles.pctLabel}>executado</span>
      </div>

      <div
        className={styles.bar}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={styles.barFill} style={{ width: `${pct}%`, background: barColor(pct) }} />
      </div>

      <div className={styles.valueTable}>
        <div className={styles.valueRow}>
          <span className={styles.valueLabel}>Valor contratado</span>
          <span className={styles.valueAmount}>{formatBRL(obra.valor_contratado)}</span>
        </div>
        <div className={styles.valueRow}>
          <span className={styles.valueLabel}>Aditivos</span>
          <span className={styles.valueAmount}>{formatBRL(obra.valor_aditivos)}</span>
        </div>
        <hr className={styles.divider} />
        <div className={styles.valueRow}>
          <span className={`${styles.valueLabel} ${styles.totalLabel}`}>Total</span>
          <span className={`${styles.valueAmount} ${styles.totalAmount}`}>
            {formatBRL(valorTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}

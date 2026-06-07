import { getIEOPColor } from "../dashboard/ieop";
import styles from "./MarkerPopup.module.css";
import { getRiscoNivel } from "./mapaUtils";
import type { ObraMapPoint } from "./types";
import { STATUS_LABELS } from "./types";

interface MarkerPopupProps {
  obra: ObraMapPoint;
}

export function MarkerPopup({ obra }: MarkerPopupProps) {
  const risco = getRiscoNivel(obra.prob_atraso);
  const probPct = Math.round(obra.prob_atraso * 100);

  const probClass = risco === "alto" ? styles.high : risco === "medio" ? styles.medium : styles.low;

  const barColor =
    obra.execucao_percentual >= 70
      ? "#1D9E75"
      : obra.execucao_percentual >= 40
        ? "#BA7517"
        : "#A32D2D";

  return (
    <div className={styles.popup}>
      <p className={styles.title}>{obra.nome}</p>

      <div className={styles.row}>
        <span className={styles.rowLabel}>Status</span>
        <span className={styles.rowValue}>{STATUS_LABELS[obra.status]}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.rowLabel}>Execução</span>
        <span className={styles.rowValue}>{obra.execucao_percentual.toFixed(1)}%</span>
      </div>
      <div
        className={styles.progressBar}
        role="progressbar"
        aria-valuenow={obra.execucao_percentual}
      >
        <div
          className={styles.progressFill}
          style={{ width: `${obra.execucao_percentual}%`, background: barColor }}
        />
      </div>

      <div className={styles.row}>
        <span className={styles.rowLabel}>Prob. atraso</span>
        <span className={`${styles.rowValue} ${probClass}`}>{probPct}%</span>
      </div>

      <div className={styles.row}>
        <span className={styles.rowLabel}>IEOP</span>
        <span className={styles.rowValue} style={{ color: getIEOPColor(obra.ieop_score) }}>
          {obra.ieop_score != null ? obra.ieop_score.toFixed(1) : "—"}
          {obra.ieop_classe ? ` (${obra.ieop_classe})` : ""}
        </span>
      </div>

      <hr className={styles.divider} />
      <p className={styles.fornecedor} title={obra.fornecedor}>
        {obra.fornecedor}
      </p>
    </div>
  );
}

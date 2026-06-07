import { IEOPBadge } from "../../../components/IEOPBadge";
import { getIEOPColor } from "../../dashboard/ieop";
import styles from "./CardIEOP.module.css";
import type { ObraDetalhe } from "./types";

// Componentes do IEOP (escala 0–100). Espelha os campos do duopen-ml:
// C = custo, P = prazo/atraso, R = recorrência, E = execução.
const COMPONENTES = [
  { label: "Custo", key: "ieop_custo" },
  { label: "Prazo", key: "ieop_atraso" },
  { label: "Recorrência", key: "ieop_recorrencia" },
  { label: "Execução", key: "ieop_execucao" },
] as const;

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

interface CardIEOPProps {
  obra: ObraDetalhe;
}

export function CardIEOP({ obra }: CardIEOPProps) {
  const score = obra.ieop_score;

  return (
    <div className={styles.card}>
      <p className={styles.title}>IEOP — Eficiência da obra</p>

      {score == null ? (
        <p className={styles.empty}>Índice ainda não calculado para esta obra.</p>
      ) : (
        <>
          <div className={styles.score}>
            <span className={styles.scoreValue} style={{ color: getIEOPColor(score) }}>
              {score.toFixed(2)}
            </span>
            <IEOPBadge classe={obra.ieop_classe ?? null} />
          </div>

          <div className={styles.components}>
            {COMPONENTES.map(({ label, key }) => {
              const value = obra[key];
              const largura = value != null ? Math.min(100, Math.max(0, value)) : 0;
              return (
                <div key={key} className={styles.row}>
                  <span className={styles.rowLabel}>{label}</span>
                  <div className={styles.track}>
                    <div
                      className={styles.fill}
                      style={{ width: `${largura}%`, background: getIEOPColor(value) }}
                    />
                  </div>
                  <span className={styles.rowValue}>{value != null ? value.toFixed(2) : "—"}</span>
                </div>
              );
            })}
          </div>

          {obra.ieop_calculado_em && (
            <p className={styles.updated}>Calculado em {formatDateTime(obra.ieop_calculado_em)}</p>
          )}
        </>
      )}
    </div>
  );
}

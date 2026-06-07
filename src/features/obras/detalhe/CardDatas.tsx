import { formatDate } from "../formatters";
import styles from "./CardDatas.module.css";
import type { ObraDetalhe } from "./types";

interface CardDatasProps {
  obra: ObraDetalhe;
}

function AtrasoValue({ dias }: { dias: number }) {
  if (dias > 0)
    return (
      <span className={styles.atrasoPositive}>
        {dias} {dias === 1 ? "dia" : "dias"} de atraso
      </span>
    );
  if (dias < 0)
    return <span className={styles.atrasoNegative}>{Math.abs(dias)} dias adiantado</span>;
  return <span className={styles.atrasoZero}>No prazo</span>;
}

export function CardDatas({ obra }: CardDatasProps) {
  return (
    <div className={styles.card}>
      <p className={styles.title}>Datas</p>

      <div className={styles.dateRow}>
        <span className={styles.dateLabel}>Início</span>
        <span className={styles.dateValue}>{formatDate(obra.data_inicio)}</span>
      </div>

      <div className={styles.dateRow}>
        <span className={styles.dateLabel}>Previsão de término</span>
        <span className={styles.dateValue}>{formatDate(obra.previsao_termino)}</span>
      </div>

      <div className={styles.dateRow}>
        <span className={styles.dateLabel}>Situação</span>
        <AtrasoValue dias={obra.atraso_dias} />
      </div>
    </div>
  );
}

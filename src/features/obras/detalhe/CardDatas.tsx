import { formatDate } from "../formatters";
import styles from "./CardDatas.module.css";
import type { ObraDetalhe } from "./types";

interface CardDatasProps {
  obra: ObraDetalhe;
}

// dias === null: backend não informou o atraso; não dá para afirmar "No prazo".
function AtrasoValue({ dias }: { dias: number | null }) {
  if (dias == null) return <span className={styles.vazio}>Não informado</span>;
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

function DataValue({ data }: { data: string }) {
  if (!data) return <span className={styles.vazio}>Não informada</span>;
  return <span className={styles.dateValue}>{formatDate(data)}</span>;
}

export function CardDatas({ obra }: CardDatasProps) {
  return (
    <div className={styles.card}>
      <p className={styles.title}>Datas</p>

      <div className={styles.dateRow}>
        <span className={styles.dateLabel}>Início</span>
        <DataValue data={obra.data_inicio} />
      </div>

      <div className={styles.dateRow}>
        <span className={styles.dateLabel}>Previsão de término</span>
        <DataValue data={obra.previsao_termino} />
      </div>

      <div className={styles.dateRow}>
        <span className={styles.dateLabel}>Situação</span>
        <AtrasoValue dias={obra.atraso_dias} />
      </div>
    </div>
  );
}

import styles from "./AlertCard.module.css";
import { formatProb } from "./formatters";
import { AlertSkeleton } from "./Skeleton";
import type { Obra } from "./types";

function probClass(prob: number): string {
  if (prob >= 0.7) return styles.high;
  if (prob >= 0.4) return styles.medium;
  return styles.low;
}

interface AlertCardProps {
  data: Obra[] | undefined;
  isLoading: boolean;
}

export function AlertCard({ data, isLoading }: AlertCardProps) {
  if (isLoading) return <AlertSkeleton />;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>Risco de atraso</span>
        <span className={styles.subtitle}>Top 5 obras</span>
      </div>

      <ul className={styles.list} role="list">
        {!data || data.length === 0 ? (
          <li className={styles.empty}>Nenhuma obra encontrada.</li>
        ) : (
          data.map((obra, i) => (
            <li key={obra.id} className={styles.item}>
              <span className={styles.rank}>{i + 1}</span>
              <div className={styles.info}>
                <p className={styles.name} title={obra.nome}>
                  {obra.nome}
                </p>
                <p className={styles.secretaria}>{obra.secretaria}</p>
              </div>
              <span className={`${styles.prob} ${probClass(obra.prob_atraso)}`}>
                {formatProb(obra.prob_atraso)}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

import styles from "./Skeleton.module.css";

export function CardSkeleton() {
  return (
    <div className={styles.card} aria-busy="true" aria-label="Carregando métrica">
      <div className={styles.cardLabel} />
      <div className={styles.cardValue} />
      <div className={styles.cardFooter} />
    </div>
  );
}

export function ChartSkeleton({ title }: { title?: string }) {
  return (
    <div className={styles.chart} aria-busy="true" aria-label={`Carregando ${title ?? "gráfico"}`}>
      {title ? (
        <span
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            color: "var(--color-text-secondary)",
          }}
        >
          {title}
        </span>
      ) : (
        <div className={styles.chartTitle} />
      )}
      <div className={styles.chartBody} />
    </div>
  );
}

export function AlertSkeleton() {
  return (
    <div className={styles.alertCard} aria-busy="true" aria-label="Carregando alertas">
      <div className={styles.alertHeader} />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={styles.alertItem}>
          <div className={styles.alertDot} />
          <div className={styles.alertText} />
          <div className={styles.alertBadge} />
        </div>
      ))}
    </div>
  );
}

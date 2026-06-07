import styles from "./DetailSkeleton.module.css";

function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className={styles.card} aria-busy="true">
      <div className={styles.lineShort} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={i % 3 === 2 ? styles.lineLong : styles.line} />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div aria-label="Carregando detalhes da obra…">
      {/* Header */}
      <div className={styles.card} style={{ marginBottom: "var(--space-6)" }} aria-busy="true">
        <div className={styles.blockSm} />
        <div className={`${styles.line} ${styles.lineLong}`} style={{ height: 28 }} />
        <div className={styles.blockSm} />
      </div>

      {/* 3 cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "var(--space-6)",
          marginBottom: "var(--space-6)",
        }}
      >
        <SkeletonCard rows={4} />
        <SkeletonCard rows={3} />
        <SkeletonCard rows={4} />
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-6)" }}>
        <div className={styles.card} aria-busy="true">
          <div className={styles.lineShort} />
          <div className={styles.blockLg} />
          <div className={styles.line} />
          <div className={styles.line} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <SkeletonCard rows={2} />
          <SkeletonCard rows={3} />
        </div>
      </div>
    </div>
  );
}

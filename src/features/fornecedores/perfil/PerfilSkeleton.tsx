import styles from "./PerfilSkeleton.module.css";

function Card({ rows = 3 }: { rows?: number }) {
  return (
    <div className={styles.card} aria-busy="true">
      <div className={styles.lineShort} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={styles.line} />
      ))}
    </div>
  );
}

export function PerfilSkeleton() {
  return (
    <div aria-label="Carregando perfil do fornecedor…">
      {/* Header */}
      <div className={styles.card} style={{ marginBottom: "var(--space-6)" }} aria-busy="true">
        <div className={styles.lineShort} />
        <div className={styles.title} />
        <div className={styles.lineShort} />
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-4)" }}
        >
          <div className={styles.blockMd} />
          <div className={styles.blockMd} />
          <div className={styles.blockMd} />
          <div className={styles.blockMd} />
        </div>
      </div>

      {/* Charts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-6)",
          marginBottom: "var(--space-6)",
        }}
      >
        <div className={styles.card} aria-busy="true">
          <div className={styles.lineShort} />
          <div className={styles.blockLg} />
        </div>
        <div className={styles.card} aria-busy="true">
          <div className={styles.lineShort} />
          <div className={styles.blockLg} />
        </div>
      </div>

      {/* Table */}
      <Card rows={4} />
    </div>
  );
}

import { useState } from "react";
import styles from "./SourceCard.module.css";
import type { Source } from "./types";

function SourceItem({ source }: { source: Source }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.card}>
      <div
        className={styles.cardHeader}
        onClick={() => setOpen((o) => !o)}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onKeyDown={(e) => e.key === "Enter" && setOpen((o) => !o)}
      >
        <span className={styles.cardTitle}>{source.titulo}</span>
        <div className={styles.cardMeta}>
          <span className={styles.relevancia}>
            {Math.round(source.relevancia * 100)}% relevante
          </span>
          <span className={`${styles.chevron} ${open ? styles.open : ""}`}>›</span>
        </div>
      </div>

      {open && (
        <div className={styles.cardBody}>
          <p className={styles.trecho}>"{source.trecho}"</p>
          {source.obra && <p className={styles.obra}>Obra: {source.obra}</p>}
        </div>
      )}
    </div>
  );
}

interface SourceCardProps {
  sources: Source[];
}

export function SourceCard({ sources }: SourceCardProps) {
  return (
    <div className={styles.sources}>
      <p className={styles.sourcesLabel}>Fontes consultadas ({sources.length})</p>
      {sources.map((s) => (
        <SourceItem key={s.id} source={s} />
      ))}
    </div>
  );
}

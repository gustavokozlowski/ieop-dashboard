import styles from "./SessionHistory.module.css";
import type { Message } from "./types";

interface SessionHistoryProps {
  userMessages: Message[];
  onScrollTo: (id: string) => void;
  onClear: () => void;
}

export function SessionHistory({ userMessages, onScrollTo, onClear }: SessionHistoryProps) {
  return (
    <aside className={styles.sidebar} aria-label="Histórico da sessão">
      <div className={styles.header}>
        <span className={styles.title}>Histórico</span>
        <button
          className={styles.clearBtn}
          onClick={onClear}
          title="Limpar histórico"
          aria-label="Limpar histórico"
        >
          Limpar
        </button>
      </div>

      <div className={styles.list} role="list">
        {userMessages.map((m, i) => (
          <button
            key={m.id}
            className={styles.item}
            onClick={() => onScrollTo(m.id)}
            title={m.content}
            role="listitem"
            aria-label={`Pergunta ${i + 1}: ${m.content}`}
          >
            <span className={styles.itemNum}>{i + 1}.</span>
            {m.content}
          </button>
        ))}
      </div>
    </aside>
  );
}

import styles from "./SuggestionList.module.css";
import { CATEGORY_ICON, SUGGESTIONS } from "./suggestions";

interface SuggestionListProps {
  onSelect: (text: string) => void;
  disabled?: boolean;
}

export function SuggestionList({ onSelect, disabled }: SuggestionListProps) {
  return (
    <div className={styles.wrapper}>
      <p className={styles.label}>Sugestões de perguntas</p>
      <div className={styles.chips}>
        {SUGGESTIONS.map((s) => (
          <button
            key={s.text}
            className={styles.chip}
            onClick={() => onSelect(s.text)}
            disabled={disabled}
          >
            <span className={styles.chipIcon} aria-hidden>
              {CATEGORY_ICON[s.category]}
            </span>
            {s.text}
          </button>
        ))}
      </div>
    </div>
  );
}

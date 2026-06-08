import styles from "./LoadingSpinner.module.css";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  /** Preenche e centraliza na área disponível — para fallbacks de rota,
   * que são renderizados como filhos diretos do #root (flex). */
  fullPage?: boolean;
}

export function LoadingSpinner({
  size = "md",
  label = "Carregando…",
  fullPage = false,
}: LoadingSpinnerProps) {
  const classes = [styles.wrapper, size !== "md" && styles[size], fullPage && styles.fullPage]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes} role="status">
      <div className={styles.spinner} aria-hidden />
      <span className="sr-only">{label}</span>
    </div>
  );
}

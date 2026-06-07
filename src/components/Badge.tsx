import styles from "./Badge.module.css";

export type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "info";

const LABELS: Record<BadgeVariant, string> = {
  success: "Concluída",
  warning: "Risco médio",
  danger: "Risco alto",
  neutral: "—",
  info: "Em andamento",
};

interface BadgeProps {
  label?: string;
  variant?: BadgeVariant;
  dot?: boolean;
}

export function Badge({ label, variant = "neutral", dot = true }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {dot && <span className={styles.dot} aria-hidden />}
      {label ?? LABELS[variant]}
    </span>
  );
}

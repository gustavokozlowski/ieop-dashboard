import styles from "./LoadingSpinner.module.css";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function LoadingSpinner({ size = "md", label = "Carregando…" }: LoadingSpinnerProps) {
  return (
    <div className={`${styles.wrapper} ${size !== "md" ? styles[size] : ""}`} role="status">
      <div className={styles.spinner} aria-hidden />
      <span className="sr-only">{label}</span>
    </div>
  );
}

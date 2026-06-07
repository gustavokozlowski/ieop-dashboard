import styles from "./ExecutionBar.module.css";

function barColor(pct: number): string {
  if (pct >= 70) return "#1D9E75";
  if (pct >= 40) return "#BA7517";
  return "#A32D2D";
}

interface ExecutionBarProps {
  value: number; // 0–100
}

export function ExecutionBar({ value }: ExecutionBarProps) {
  return (
    <div className={styles.wrapper}>
      <div
        className={styles.bar}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={styles.fill}
          style={{ width: `${Math.min(value, 100)}%`, background: barColor(value) }}
        />
      </div>
      <span className={styles.text}>{value.toFixed(0)}%</span>
    </div>
  );
}

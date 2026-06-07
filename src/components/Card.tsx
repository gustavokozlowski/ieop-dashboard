import type { ReactNode } from "react";
import styles from "./Card.module.css";
import { ArrowDownIcon, ArrowUpIcon } from "./icons";

type CardVariant = "default" | "success" | "warning" | "danger";
type TrendDirection = "up" | "down" | "flat";

interface CardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  variant?: CardVariant;
  /** Variação percentual vs. período anterior (pode ser negativa). */
  trend?: number;
  /** Texto acessível opcional do delta (ex.: "vs. período anterior"). */
  trendLabel?: string;
  footer?: ReactNode;
}

function formatPct(n: number): string {
  return Math.abs(n).toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
}

export function Card({
  title,
  value,
  icon,
  variant = "default",
  trend,
  trendLabel,
  footer,
}: CardProps) {
  const dir: TrendDirection =
    trend === undefined || trend === 0 ? "flat" : trend > 0 ? "up" : "down";

  return (
    <div className={styles.card}>
      {/* topo: ícone à esquerda, delta à direita */}
      <div className={styles.top}>
        {icon && (
          <span
            className={`${styles.icon} ${variant !== "default" ? styles[variant] : ""}`}
            aria-hidden
          >
            {icon}
          </span>
        )}
        {trend !== undefined && (
          <span className={`${styles.delta} ${styles[dir]}`} title={trendLabel}>
            {dir === "up" && <ArrowUpIcon />}
            {dir === "down" && <ArrowDownIcon />}
            {formatPct(trend)}%
          </span>
        )}
      </div>

      <span className={styles.value}>{value}</span>
      <span className={styles.label}>{title}</span>

      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}

import { useState } from "react";
import styles from "./PeriodToggle.module.css";
import type { Period } from "./types";

const WINDOWS = [
  { key: "30", label: "30 dias", days: 30 },
  { key: "90", label: "90 dias", days: 90 },
  { key: "365", label: "12 meses", days: 365 },
] as const;

function periodFor(days: number): Period {
  const fim = new Date();
  const inicio = new Date(fim);
  inicio.setDate(inicio.getDate() - days);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { dataInicio: iso(inicio), dataFim: iso(fim) };
}

interface Props {
  onChange: (p: Period) => void;
  initial?: (typeof WINDOWS)[number]["key"];
}

/** Filtro de período segmentado (30 dias / 90 dias / 12 meses). */
export function PeriodToggle({ onChange, initial = "30" }: Props) {
  const [active, setActive] = useState<string>(initial);
  return (
    <div className={styles.seg} role="group" aria-label="Filtro de período">
      {WINDOWS.map((w) => (
        <button
          key={w.key}
          type="button"
          className={`${styles.btn} ${active === w.key ? styles.active : ""}`}
          aria-pressed={active === w.key}
          onClick={() => {
            setActive(w.key);
            onChange(periodFor(w.days));
          }}
        >
          {w.label}
        </button>
      ))}
    </div>
  );
}

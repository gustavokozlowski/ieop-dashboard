import type { ObraStatus } from "../dashboard/types";
import styles from "./MapFilters.module.css";
import type { MapFilter, RiscoNivel } from "./types";
import { RISCO_LABELS, STATUS_LABELS } from "./types";

const DEFAULT_FILTER: MapFilter = {
  risco: "todos",
  secretaria: "todas",
  status: "todos",
};

interface MapFiltersProps {
  filter: MapFilter;
  onChange: (f: MapFilter) => void;
  secretarias: string[];
  totalFiltradas: number;
  totalGeral: number;
}

export function MapFilters({
  filter,
  onChange,
  secretarias,
  totalFiltradas,
  totalGeral,
}: MapFiltersProps) {
  return (
    <aside className={styles.sidebar} aria-label="Filtros do mapa">
      <div className={styles.header}>
        <span>Filtros</span>
        <span className={styles.count}>
          {totalFiltradas}/{totalGeral} obras
        </span>
      </div>

      <div className={styles.body}>
        <div className={styles.group}>
          <label className={styles.label} htmlFor="filter-risco">
            Nível de risco
          </label>
          <select
            id="filter-risco"
            className={styles.select}
            value={filter.risco}
            onChange={(e) => onChange({ ...filter, risco: e.target.value as RiscoNivel | "todos" })}
          >
            <option value="todos">Todos</option>
            {(Object.entries(RISCO_LABELS) as [RiscoNivel, string][]).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.group}>
          <label className={styles.label} htmlFor="filter-secretaria">
            Secretaria
          </label>
          <select
            id="filter-secretaria"
            className={styles.select}
            value={filter.secretaria}
            onChange={(e) => onChange({ ...filter, secretaria: e.target.value })}
          >
            <option value="todas">Todas</option>
            {secretarias.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.group}>
          <label className={styles.label} htmlFor="filter-status">
            Status
          </label>
          <select
            id="filter-status"
            className={styles.select}
            value={filter.status}
            onChange={(e) =>
              onChange({ ...filter, status: e.target.value as ObraStatus | "todos" })
            }
          >
            <option value="todos">Todos</option>
            {(Object.entries(STATUS_LABELS) as [ObraStatus, string][]).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <button
          className={styles.resetBtn}
          onClick={() => onChange(DEFAULT_FILTER)}
          aria-label="Resetar filtros"
        >
          Limpar filtros
        </button>
      </div>
    </aside>
  );
}

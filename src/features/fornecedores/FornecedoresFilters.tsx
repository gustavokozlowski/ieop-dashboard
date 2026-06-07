import { RISCO_LABELS } from "../mapa/types";
import styles from "./FornecedoresFilters.module.css";
import type { FornecedoresFilter, RiscoNivel } from "./types";
import { DEFAULT_FILTER } from "./types";

interface FornecedoresFiltersProps {
  filter: FornecedoresFilter;
  onChange: (f: FornecedoresFilter) => void;
  total: number;
  filtered: number;
}

export function FornecedoresFilters({
  filter,
  onChange,
  total,
  filtered,
}: FornecedoresFiltersProps) {
  const set = <K extends keyof FornecedoresFilter>(k: K, v: FornecedoresFilter[K]) =>
    onChange({ ...filter, [k]: v });

  return (
    <div className={styles.panel} role="search" aria-label="Filtros de fornecedores">
      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon} aria-hidden>
          ⌕
        </span>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Buscar por razão social ou CNPJ…"
          value={filter.search}
          onChange={(e) => set("search", e.target.value)}
          aria-label="Buscar fornecedor"
        />
      </div>

      <select
        className={styles.select}
        value={filter.risco}
        onChange={(e) => set("risco", e.target.value as RiscoNivel | "todos")}
        aria-label="Filtrar por nível de risco"
      >
        <option value="todos">Todos os riscos</option>
        {(Object.entries(RISCO_LABELS) as [RiscoNivel, string][]).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>

      <label className={styles.toggle}>
        <input
          type="checkbox"
          checked={filter.somenteAlerta}
          onChange={(e) => set("somenteAlerta", e.target.checked)}
          aria-label="Exibir somente fornecedores com alerta de aditivos"
        />
        <span className={styles.alertLabel}>⚠ Somente com alerta ({">"}30%)</span>
      </label>

      <span
        style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginLeft: "auto" }}
      >
        {filtered} de {total} fornecedores
      </span>

      {(filter.search || filter.somenteAlerta || filter.risco !== "todos") && (
        <button
          onClick={() => onChange(DEFAULT_FILTER)}
          style={{
            background: "none",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-text-muted)",
            fontSize: "var(--text-sm)",
            padding: "var(--space-1) var(--space-3)",
            cursor: "pointer",
          }}
        >
          Limpar
        </button>
      )}
    </div>
  );
}

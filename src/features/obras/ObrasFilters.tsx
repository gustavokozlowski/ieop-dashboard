import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { SearchIcon } from "../../components/icons";
import type { ObrasFilterValues } from "../../schemas/obras.schema";
import { RISCO_LABELS, STATUS_LABELS } from "../mapa/types";
import styles from "./ObrasFilters.module.css";
import type { ObraStatus, RiscoNivel } from "./types";
import { DEFAULT_FILTER } from "./types";

interface ObrasFiltersProps {
  filter: ObrasFilterValues;
  onChange: (f: ObrasFilterValues) => void;
  secretarias: string[];
  bairros: string[];
}

export function ObrasFilters({ filter, onChange, secretarias, bairros }: ObrasFiltersProps) {
  // RHF gerencia o formulário; o tipo vem do schema Zod (z.infer).
  const { register, watch, reset } = useForm<ObrasFilterValues>({
    defaultValues: filter,
  });

  // Filtro ao vivo: propaga cada alteração para o estado da página.
  useEffect(() => {
    const sub = watch((values) => onChange(values as ObrasFilterValues));
    return () => sub.unsubscribe();
  }, [watch, onChange]);

  // Datas dependentes (min/max) precisam observar os valores atuais.
  const periodoInicio = watch("periodoInicio");
  const periodoFim = watch("periodoFim");

  return (
    <div className={styles.panel} role="search" aria-label="Filtros de obras">
      {/* Row 1: search */}
      <div className={styles.row}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon} aria-hidden>
            <SearchIcon />
          </span>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Buscar por nome ou nº do contrato…"
            aria-label="Buscar obras"
            {...register("search")}
          />
        </div>

        <button
          type="button"
          className={styles.resetBtn}
          onClick={() => reset(DEFAULT_FILTER)}
          aria-label="Limpar todos os filtros"
        >
          Limpar filtros
        </button>
      </div>

      {/* Row 2: selects + period */}
      <div className={styles.row}>
        <select className={styles.select} aria-label="Filtrar por status" {...register("status")}>
          <option value="todos">Todos os status</option>
          {(Object.entries(STATUS_LABELS) as [ObraStatus, string][]).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          aria-label="Filtrar por secretaria"
          {...register("secretaria")}
        >
          <option value="todas">Todas as secretarias</option>
          {secretarias.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select className={styles.select} aria-label="Filtrar por bairro" {...register("bairro")}>
          <option value="todos">Todos os bairros</option>
          {bairros.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          aria-label="Filtrar por nível de risco"
          {...register("risco")}
        >
          <option value="todos">Todos os riscos</option>
          {(Object.entries(RISCO_LABELS) as [RiscoNivel, string][]).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>

        <input
          type="date"
          className={styles.dateInput}
          max={periodoFim || undefined}
          aria-label="Previsão término a partir de"
          {...register("periodoInicio")}
        />
        <span className={styles.sep}>→</span>
        <input
          type="date"
          className={styles.dateInput}
          min={periodoInicio || undefined}
          aria-label="Previsão término até"
          {...register("periodoFim")}
        />
      </div>
    </div>
  );
}

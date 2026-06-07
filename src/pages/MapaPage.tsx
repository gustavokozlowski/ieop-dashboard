import { useMemo, useState } from "react";
import { DownloadIcon } from "../components/icons";
import { PageLayout } from "../components/PageLayout";
import { MacaeMap } from "../features/mapa/MacaeMap";
import styles from "../features/mapa/MapaPage.module.css";
import { MapFilters } from "../features/mapa/MapFilters";
import { exportToCsv, filterObras, getUniqueSecretarias } from "../features/mapa/mapaUtils";
import type { MapFilter } from "../features/mapa/types";
import { useMapaObras } from "../features/mapa/useMapa";

const DEFAULT_FILTER: MapFilter = {
  risco: "todos",
  secretaria: "todas",
  status: "todos",
};

export function MapaPage() {
  const { data: obras = [], isLoading } = useMapaObras();
  const [filter, setFilter] = useState<MapFilter>(DEFAULT_FILTER);

  const secretarias = useMemo(() => getUniqueSecretarias(obras), [obras]);
  const obrasFiltradas = useMemo(() => filterObras(obras, filter), [obras, filter]);

  return (
    <PageLayout pageTitle="Mapa de obras" breadcrumb="Macaé / Relatórios / Mapa">
      <div className={styles.wrapper}>
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <span className={styles.pageTitle}>Mapa interativo — Macaé</span>
            <span className={styles.pageSubtitle}>
              {isLoading
                ? "Carregando…"
                : `${obrasFiltradas.length} obra${obrasFiltradas.length !== 1 ? "s" : ""} exibida${obrasFiltradas.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          <button
            type="button"
            className={styles.exportBtn}
            onClick={() => exportToCsv(obrasFiltradas)}
            disabled={obrasFiltradas.length === 0}
            aria-label="Exportar obras filtradas como CSV"
            style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}
          >
            <DownloadIcon width={16} height={16} /> Exportar CSV
          </button>
        </div>

        <div className={styles.body}>
          <MapFilters
            filter={filter}
            onChange={setFilter}
            secretarias={secretarias}
            totalFiltradas={obrasFiltradas.length}
            totalGeral={obras.length}
          />
          <MacaeMap obras={obrasFiltradas} isLoading={isLoading} />
        </div>
      </div>
    </PageLayout>
  );
}

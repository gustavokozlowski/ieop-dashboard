import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { BadgeVariant } from "../components/Badge";
import { Badge } from "../components/Badge";
import { Footer } from "../components/Footer";
import { IEOPBadge } from "../components/IEOPBadge";
import { DownloadIcon } from "../components/icons";
import { PageLayout } from "../components/PageLayout";
import { type Column, Table } from "../components/Table";
import { getIEOPColor } from "../features/dashboard/ieop";
import { STATUS_LABELS } from "../features/mapa/types";
import { ExecutionBar } from "../features/obras/ExecutionBar";
import {
  formatBRL,
  formatDateShort,
  normalizeNome,
  normalizeSecretaria,
} from "../features/obras/formatters";
import { ObrasFilters } from "../features/obras/ObrasFilters";
import { exportObrasCsv, filterObras, getDistinct } from "../features/obras/obrasUtils";
import { RiskBadge } from "../features/obras/RiskBadge";
import type { ObraListItem, ObraStatus, ObrasFilter } from "../features/obras/types";
import { DEFAULT_FILTER } from "../features/obras/types";
import { useObras } from "../features/obras/useObras";

const STATUS_VARIANT: Record<ObraStatus, BadgeVariant> = {
  em_andamento: "info",
  concluida: "success",
  paralisada: "warning",
  atrasada: "danger",
  nao_iniciada: "neutral",
  cancelada: "danger",
};

const COLUMNS: Column<ObraListItem>[] = [
  {
    key: "nome",
    header: "Obra / Contrato",
    sortable: true,
    render: (_, row) => (
      <div style={{ maxWidth: 240 }}>
        <div
          title={String(row.nome)}
          style={{
            fontWeight: 500,
            color: "var(--color-text-primary)",
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {normalizeNome(String(row.nome))}
        </div>
        <div
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-mono)",
            marginTop: 2,
          }}
        >
          {String(row.numero_contrato)}
        </div>
      </div>
    ),
  },
  {
    key: "secretaria",
    header: "Secretaria",
    sortable: true,
    render: (v) => (
      <span title={String(v)} style={{ whiteSpace: "nowrap" }}>
        {normalizeSecretaria(String(v))}
      </span>
    ),
  },
  { key: "bairro", header: "Bairro", sortable: true },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (v) => (
      <Badge
        label={STATUS_LABELS[v as ObraStatus]}
        variant={STATUS_VARIANT[v as ObraStatus] ?? "neutral"}
        dot={false}
      />
    ),
  },
  {
    key: "execucao_percentual",
    header: "Execução",
    sortable: true,
    render: (v) => <ExecutionBar value={Number(v)} />,
  },
  {
    key: "valor_contratado",
    header: "Valor",
    sortable: true,
    render: (v) => (
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" }}>
        {formatBRL(Number(v))}
      </span>
    ),
  },
  {
    key: "prob_atraso",
    header: "Risco",
    sortable: true,
    render: (v) => <RiskBadge prob={Number(v)} />,
  },
  {
    key: "ieop_score",
    header: "IEOP",
    sortable: true,
    render: (v, row) => {
      const score = v as number | null | undefined;
      const classe = (row.ieop_classe as string | null | undefined) ?? null;
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <span
            style={{
              fontWeight: 700,
              fontSize: "var(--text-base)",
              width: 36,
              textAlign: "right",
              color: getIEOPColor(score),
            }}
          >
            {score != null ? score.toFixed(1) : "—"}
          </span>
          <IEOPBadge classe={classe} size="sm" />
        </div>
      );
    },
  },
  {
    key: "previsao_termino",
    header: "Previsão término",
    sortable: true,
    render: (v) => formatDateShort(String(v)),
  },
];

export function ObrasPage() {
  const navigate = useNavigate();
  const { data: obras = [], isLoading } = useObras();
  const [filter, setFilter] = useState<ObrasFilter>(DEFAULT_FILTER);

  const secretarias = useMemo(() => getDistinct(obras, "secretaria"), [obras]);
  const bairros = useMemo(() => getDistinct(obras, "bairro"), [obras]);
  const filtradas = useMemo(() => filterObras(obras, filter), [obras, filter]);

  return (
    <PageLayout
      pageTitle="Obras"
      breadcrumb="Macaé / Obras"
      headerRight={
        <>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              color: "var(--color-text-muted)",
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--color-success)",
                boxShadow: "0 0 6px var(--color-success)",
              }}
            />
            {obras.length} obras no município
          </span>
          <button
            type="button"
            onClick={() => exportObrasCsv(filtradas)}
            disabled={filtradas.length === 0}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              padding: "var(--space-2) var(--space-4)",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-text-secondary)",
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              cursor: "pointer",
            }}
            aria-label="Exportar obras filtradas como CSV"
          >
            <DownloadIcon width={16} height={16} /> Exportar CSV
            <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>
              ({filtradas.length})
            </span>
          </button>
        </>
      }
    >
      <ObrasFilters
        filter={filter}
        onChange={setFilter}
        secretarias={secretarias}
        bairros={bairros}
      />

      <Table<ObraListItem>
        columns={COLUMNS}
        data={filtradas}
        pageSize={15}
        searchable={false}
        emptyMessage={
          isLoading ? "Carregando obras…" : "Nenhuma obra encontrada com os filtros aplicados."
        }
        onRowClick={(row) => navigate(`/obras/${String(row.id)}`)}
      />

      <Footer />
    </PageLayout>
  );
}

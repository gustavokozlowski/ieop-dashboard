import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "../components/Footer";
import { DownloadIcon } from "../components/icons";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { PageLayout } from "../components/PageLayout";
import { type Column, Table } from "../components/Table";
import { AlertaBadge } from "../features/fornecedores/AlertaBadge";
import { FornecedoresFilters } from "../features/fornecedores/FornecedoresFilters";
import { formatBRL, formatCnpj } from "../features/fornecedores/formatters";
import {
  exportFornecedoresCsv,
  filterFornecedores,
  hasAlerta,
} from "../features/fornecedores/fornecedoresUtils";
import type { FornecedoresFilter, FornecedorRanking } from "../features/fornecedores/types";
import { DEFAULT_FILTER } from "../features/fornecedores/types";
import { useFornecedores } from "../features/fornecedores/useFornecedores";
import { RiskBadge } from "../features/obras/RiskBadge";

const COLUMNS: Column<FornecedorRanking>[] = [
  {
    key: "cnpj",
    header: "CNPJ",
    render: (v) => (
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-xs)",
          color: "var(--color-text-muted)",
        }}
      >
        {formatCnpj(String(v))}
      </span>
    ),
  },
  {
    key: "nome",
    header: "Razão Social",
    sortable: true,
    render: (v, row) => (
      <div
        style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}
      >
        <span style={{ fontWeight: 500 }}>{String(v)}</span>
        {hasAlerta(row as FornecedorRanking) && <AlertaBadge taxa={Number(row.taxa_aditivo)} />}
      </div>
    ),
  },
  {
    key: "total_contratos",
    header: "Contratos",
    sortable: true,
    render: (v) => (
      <span style={{ fontFamily: "var(--font-mono)" }}>{Number(v).toLocaleString("pt-BR")}</span>
    ),
  },
  {
    key: "valor_total",
    header: "Valor Total",
    sortable: true,
    render: (v) => (
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" }}>
        {formatBRL(Number(v))}
      </span>
    ),
  },
  {
    key: "taxa_aditivo",
    header: "Taxa Aditivo",
    sortable: true,
    render: (v) => {
      const pct = Number(v) * 100;
      const color =
        pct > 30
          ? "var(--color-danger)"
          : pct > 15
            ? "var(--color-warning)"
            : "var(--color-success)";
      return <span style={{ fontWeight: 600, color }}>{pct.toFixed(1)}%</span>;
    },
  },
  {
    key: "avg_prob_atraso",
    header: "Risco Médio",
    sortable: true,
    render: (v) => <RiskBadge prob={Number(v)} />,
  },
  {
    key: "total_obras",
    header: "Total Obras",
    sortable: true,
    render: (v) => <span style={{ fontFamily: "var(--font-mono)" }}>{String(v)}</span>,
  },
];

export function FornecedoresPage() {
  const navigate = useNavigate();
  const { data: lista = [], isLoading } = useFornecedores();
  const [filter, setFilter] = useState<FornecedoresFilter>(DEFAULT_FILTER);

  const filtrados = useMemo(() => filterFornecedores(lista, filter), [lista, filter]);

  return (
    <PageLayout
      pageTitle="Fornecedores"
      breadcrumb="Macaé / Fornecedores"
      headerRight={
        <button
          type="button"
          onClick={() => exportFornecedoresCsv(filtrados)}
          disabled={filtrados.length === 0}
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
        >
          <DownloadIcon width={16} height={16} /> Exportar CSV ({filtrados.length})
        </button>
      }
    >
      <FornecedoresFilters
        filter={filter}
        onChange={setFilter}
        total={lista.length}
        filtered={filtrados.length}
      />

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-12)" }}>
          <LoadingSpinner size="lg" label="Carregando fornecedores…" />
        </div>
      ) : (
        <Table<FornecedorRanking>
          columns={COLUMNS}
          data={filtrados}
          pageSize={20}
          searchable={false}
          emptyMessage="Nenhum fornecedor encontrado com os filtros aplicados."
          onRowClick={(row) => navigate(`/fornecedores/${String(row.id)}`)}
        />
      )}

      <Footer />
    </PageLayout>
  );
}

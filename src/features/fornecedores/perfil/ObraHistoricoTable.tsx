import { useNavigate } from "react-router-dom";
import type { BadgeVariant } from "../../../components/Badge";
import { Badge } from "../../../components/Badge";
import { type Column, Table } from "../../../components/Table";
import { STATUS_LABELS } from "../../mapa/types";
import { ExecutionBar } from "../../obras/ExecutionBar";
import { RiskBadge } from "../../obras/RiskBadge";
import { formatBRL, formatDate } from "../formatters";
import type { ObraHistorico, ObraStatus } from "./types";

const STATUS_VARIANT: Record<ObraStatus, BadgeVariant> = {
  em_andamento: "info",
  concluida: "success",
  paralisada: "warning",
  atrasada: "danger",
  nao_iniciada: "neutral",
  cancelada: "danger",
};

const COLUMNS: Column<ObraHistorico>[] = [
  { key: "nome", header: "Obra", sortable: true },
  { key: "secretaria", header: "Secretaria", sortable: true },
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
    key: "data_inicio",
    header: "Início",
    sortable: true,
    render: (v) => formatDate(String(v)),
  },
  {
    key: "previsao_termino",
    header: "Previsão término",
    sortable: true,
    render: (v) => formatDate(String(v)),
  },
];

interface ObraHistoricoTableProps {
  obras: ObraHistorico[];
}

export function ObraHistoricoTable({ obras }: ObraHistoricoTableProps) {
  const navigate = useNavigate();

  return (
    <div style={{ marginTop: "var(--space-6)" }}>
      <p
        style={{
          fontSize: "var(--text-sm)",
          fontWeight: "var(--font-semibold)",
          color: "var(--color-text-secondary)",
          marginBottom: "var(--space-3)",
        }}
      >
        Histórico de obras ({obras.length})
      </p>
      <Table<ObraHistorico>
        columns={COLUMNS}
        data={obras}
        pageSize={10}
        searchable={false}
        emptyMessage="Nenhuma obra encontrada para este fornecedor."
        onRowClick={(row) => navigate(`/obras/${String(row.id)}`)}
      />
    </div>
  );
}

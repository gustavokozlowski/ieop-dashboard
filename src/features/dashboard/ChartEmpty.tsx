interface ChartEmptyProps {
  title: string;
  message?: string;
  height?: number;
}

// Estado vazio para cards de gráfico: usado quando os dados já carregaram
// mas não há nada para plotar (evita o ChartSkeleton parecer "carregando"
// para sempre). Espelha o wrapper inline dos gráficos.
export function ChartEmpty({
  title,
  message = "Sem dados disponíveis.",
  height = 240,
}: ChartEmptyProps) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-6)",
      }}
    >
      <p
        style={{
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          color: "var(--color-text-secondary)",
          marginBottom: "var(--space-4)",
        }}
      >
        {title}
      </p>
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "var(--color-text-muted)",
          fontSize: "var(--text-sm)",
          fontStyle: "italic",
        }}
      >
        {message}
      </div>
    </div>
  );
}

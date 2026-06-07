import { useParams } from "react-router-dom";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { Footer } from "../components/Footer";
import { PageLayout } from "../components/PageLayout";
import { ObraHistoricoTable } from "../features/fornecedores/perfil/ObraHistoricoTable";
import { PerfilHeader } from "../features/fornecedores/perfil/PerfilHeader";
import { PerfilSkeleton } from "../features/fornecedores/perfil/PerfilSkeleton";
import { RiscoEvolutionChart } from "../features/fornecedores/perfil/RiscoEvolutionChart";
import { useFornecedorPerfil } from "../features/fornecedores/perfil/useFornecedorPerfil";
import { ValorAnualChart } from "../features/fornecedores/perfil/ValorAnualChart";
import styles from "./FornecedorPerfilPage.module.css";

export function FornecedorPerfilPage() {
  const { id = "" } = useParams<{ id: string }>();
  const { data: perfil, isLoading, error } = useFornecedorPerfil(id);

  return (
    <PageLayout pageTitle="Perfil do fornecedor" breadcrumb="Macaé / Fornecedores / Perfil">
      <ErrorBoundary>
        {isLoading || !perfil ? (
          <PerfilSkeleton />
        ) : error ? (
          <div
            style={{
              padding: "var(--space-8)",
              color: "var(--color-danger)",
              background: "var(--color-danger-bg)",
              border: "1px solid var(--color-danger-border)",
              borderRadius: "var(--radius-lg)",
              fontSize: "var(--text-sm)",
            }}
          >
            Não foi possível carregar o perfil deste fornecedor.
          </div>
        ) : (
          <>
            <PerfilHeader perfil={perfil} />

            <div className={styles.grid2}>
              <ValorAnualChart data={perfil.valor_por_ano} />
              <RiscoEvolutionChart data={perfil.evolucao_risco} />
            </div>

            <ObraHistoricoTable obras={perfil.obras} />

            <Footer />
          </>
        )}
      </ErrorBoundary>
    </PageLayout>
  );
}

import { useParams } from "react-router-dom";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { Footer } from "../components/Footer";
import { PageLayout } from "../components/PageLayout";
import { CardDatas } from "../features/obras/detalhe/CardDatas";
import { CardExecucao } from "../features/obras/detalhe/CardExecucao";
import { CardFornecedor } from "../features/obras/detalhe/CardFornecedor";
import { CardIEOP } from "../features/obras/detalhe/CardIEOP";
import { CardPredicaoML } from "../features/obras/detalhe/CardPredicaoML";
import { ContratoSection } from "../features/obras/detalhe/ContratoSection";
import { DetailSkeleton } from "../features/obras/detalhe/DetailSkeleton";
import { HeaderObra } from "../features/obras/detalhe/HeaderObra";
import { MiniMapa } from "../features/obras/detalhe/MiniMapa";
import { useObraDetalhe } from "../features/obras/detalhe/useObraDetalhe";
import styles from "./ObraDetalhePage.module.css";

export function ObraDetalhePage() {
  const { id = "" } = useParams<{ id: string }>();
  const { data: obra, isLoading, error } = useObraDetalhe(id);

  return (
    <PageLayout pageTitle="Detalhe da obra" breadcrumb="Macaé / Obras / Detalhe">
      <ErrorBoundary>
        {isLoading || !obra ? (
          <DetailSkeleton />
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
            Não foi possível carregar os dados desta obra.
          </div>
        ) : (
          <>
            <HeaderObra obra={obra} />

            <div className={styles.grid3}>
              <CardExecucao obra={obra} />
              <CardDatas obra={obra} />
              <CardPredicaoML predicao={obra.predicao} />
            </div>

            <div className={styles.gridBottom}>
              <ContratoSection contratos={obra.contratos} />

              <div className={styles.sidebar}>
                <CardIEOP obra={obra} />
                <MiniMapa
                  lat={obra.lat}
                  lng={obra.lng}
                  prob_atraso={obra.predicao.prob_atraso}
                  endereco={obra.endereco}
                />
                <CardFornecedor fornecedor={obra.fornecedor} />
              </div>
            </div>

            <Footer />
          </>
        )}
      </ErrorBoundary>
    </PageLayout>
  );
}

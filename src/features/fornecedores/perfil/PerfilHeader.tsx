import { useNavigate } from "react-router-dom";
import { RiskBadge } from "../../obras/RiskBadge";
import { AlertaBadge } from "../AlertaBadge";
import { formatBRL, formatCnpj } from "../formatters";
import styles from "./PerfilHeader.module.css";
import type { FornecedorPerfil } from "./types";

interface PerfilHeaderProps {
  perfil: FornecedorPerfil;
}

export function PerfilHeader({ perfil }: PerfilHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className={styles.wrapper}>
      <button className={styles.backBtn} onClick={() => navigate("/fornecedores")}>
        ← Fornecedores
      </button>

      <h1 className={styles.nome}>{perfil.nome}</h1>

      <div className={styles.meta}>
        <span className={styles.cnpj}>{formatCnpj(perfil.cnpj)}</span>
        {(perfil.cidade ?? perfil.estado) && (
          <>
            <span className={styles.dot} aria-hidden />
            <span className={styles.location}>
              {[perfil.cidade, perfil.estado].filter(Boolean).join(" — ")}
            </span>
          </>
        )}
        {perfil.email && (
          <>
            <span className={styles.dot} aria-hidden />
            <span className={styles.location}>{perfil.email}</span>
          </>
        )}
      </div>

      <div className={styles.metricas}>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Total de contratos</p>
          <p className={styles.metricValue}>{perfil.total_contratos.toLocaleString("pt-BR")}</p>
        </div>

        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Valor total contratado</p>
          <p className={styles.metricValue}>{formatBRL(perfil.valor_total)}</p>
        </div>

        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Taxa de aditivo</p>
          <p className={styles.metricValue}>
            {(perfil.taxa_aditivo * 100).toFixed(1)}%
            <AlertaBadge taxa={perfil.taxa_aditivo} />
          </p>
        </div>

        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Risco médio</p>
          <p className={styles.metricValue}>
            {(perfil.avg_prob_atraso * 100).toFixed(1)}%
            <RiskBadge prob={perfil.avg_prob_atraso} />
          </p>
        </div>
      </div>
    </div>
  );
}

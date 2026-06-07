import styles from "./CardFornecedor.module.css";
import type { Fornecedor } from "./types";

interface CardFornecedorProps {
  fornecedor: Fornecedor;
}

function maskCnpj(cnpj: string): string {
  const d = cnpj.replace(/\D/g, "");
  if (d.length !== 14) return cnpj;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export function CardFornecedor({ fornecedor }: CardFornecedorProps) {
  return (
    <div className={styles.card}>
      <p className={styles.title}>Fornecedor</p>
      <p className={styles.nome}>{fornecedor.nome}</p>

      <div className={styles.row}>
        <span className={styles.rowLabel}>CNPJ</span>
        <span className={`${styles.rowValue} ${styles.cnpj}`}>{maskCnpj(fornecedor.cnpj)}</span>
      </div>

      {fornecedor.email && (
        <div className={styles.row}>
          <span className={styles.rowLabel}>E-mail</span>
          <span className={styles.rowValue}>{fornecedor.email}</span>
        </div>
      )}

      {fornecedor.telefone && (
        <div className={styles.row}>
          <span className={styles.rowLabel}>Telefone</span>
          <span className={styles.rowValue}>{fornecedor.telefone}</span>
        </div>
      )}

      {(fornecedor.cidade ?? fornecedor.estado) && (
        <div className={styles.row}>
          <span className={styles.rowLabel}>Sede</span>
          <span className={styles.rowValue}>
            {[fornecedor.cidade, fornecedor.estado].filter(Boolean).join(" — ")}
          </span>
        </div>
      )}

      <a
        href={`/fornecedores/${fornecedor.id}`}
        className={styles.profileLink}
        aria-label={`Ver perfil completo de ${fornecedor.nome}`}
      >
        Ver perfil completo →
      </a>
    </div>
  );
}

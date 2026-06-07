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
  const cnpjInformado = fornecedor.cnpj.replace(/\D/g, "").length > 0;
  // O detalhe da obra não traz o nome do fornecedor (adapter usa "—"); só o
  // CNPJ. Sem nome real, mostramos um rótulo discreto em vez de um traço solto.
  const nomeInformado = fornecedor.nome.trim() !== "" && fornecedor.nome.trim() !== "—";

  return (
    <div className={styles.card}>
      <p className={styles.title}>Fornecedor</p>
      <p className={`${styles.nome} ${nomeInformado ? "" : styles.nomeVazio}`}>
        {nomeInformado ? fornecedor.nome : "Fornecedor não identificado"}
      </p>

      <div className={styles.row}>
        <span className={styles.rowLabel}>CNPJ</span>
        <span className={`${styles.rowValue} ${cnpjInformado ? styles.cnpj : ""}`}>
          {cnpjInformado ? maskCnpj(fornecedor.cnpj) : "Não informado"}
        </span>
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

      {fornecedor.id.trim() !== "" && (
        <a
          href={`/fornecedores/${fornecedor.id}`}
          className={styles.profileLink}
          aria-label={
            nomeInformado ? `Ver perfil completo de ${fornecedor.nome}` : "Ver perfil completo"
          }
        >
          Ver perfil completo →
        </a>
      )}
    </div>
  );
}

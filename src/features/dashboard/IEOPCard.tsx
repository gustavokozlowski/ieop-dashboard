import { IEOPBadge } from "../../components/IEOPBadge";
import type { IEOPStats } from "../../schemas/ieop.schema";
import styles from "./IEOPCard.module.css";
import { getIEOPColor } from "./ieop";

// Faixas exibidas da pior para a melhor (espelha o protótipo).
const FAIXAS = [
  { classe: "Crítico", cor: "var(--ieop-critico)" },
  { classe: "Ruim", cor: "var(--ieop-ruim)" },
  { classe: "Regular", cor: "var(--ieop-regular)" },
  { classe: "Bom", cor: "var(--ieop-bom)" },
  { classe: "Ótimo", cor: "var(--ieop-otimo)" },
] as const;

export interface IEOPComponente {
  sig: string; // C · P · R · E
  nome: string;
  valor: number; // 0–100
}

interface Props {
  stats: IEOPStats;
  /** Subtítulo opcional no cabeçalho (ex.: "média municipal · 342 obras"). */
  subtitle?: string;
  /** Componentes C·P·R·E (média municipal real). Omitido quando indisponível. */
  componentes?: IEOPComponente[];
}

export function IEOPCard({ stats, subtitle, componentes }: Props) {
  const cor = getIEOPColor(stats.media_geral);
  const pct = Math.min(100, Math.max(0, stats.media_geral));

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <span className={styles.title}>Índice de Eficiência — Macaé</span>
        {subtitle && <span className={styles.sub}>{subtitle}</span>}
      </div>

      <div className={styles.top}>
        <div
          className={styles.gauge}
          style={{
            background: `conic-gradient(${cor} 0 ${pct}%, var(--color-surface2) ${pct}% 100%)`,
          }}
        >
          <div className={styles.gaugeVal}>
            <div className={styles.gaugeNum} style={{ color: cor }}>
              {stats.media_geral.toFixed(1)}
            </div>
            <div className={styles.gaugeLabel}>de 100</div>
          </div>
        </div>

        <div className={styles.meta}>
          <div
            className={styles.metaTitle}
            style={{ display: "flex", gap: 10, alignItems: "center" }}
          >
            Classe geral <IEOPBadge classe={stats.classe_geral} />
          </div>
          <p className={styles.metaSub}>
            O IEOP combina quatro componentes — custo, atraso, recorrência e execução — num índice
            de 0 a 100 por obra.
          </p>
          <div className={styles.faixas}>
            {FAIXAS.map((f) => {
              const on = f.classe === stats.classe_geral;
              return (
                <div key={f.classe} className={`${styles.faixa} ${on ? styles.on : ""}`}>
                  <div className={styles.faixaBar} style={{ background: f.cor }} />
                  <div className={styles.faixaLbl}>{f.classe}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {componentes && componentes.length > 0 && (
        <div className={styles.comps}>
          {componentes.map((c) => {
            const cc = getIEOPColor(c.valor);
            return (
              <div key={c.sig}>
                <div className={styles.compHead}>
                  <span className={styles.compName}>
                    <span className={styles.compSig}>{c.sig}</span>
                    {c.nome}
                  </span>
                  <span className={styles.compVal} style={{ color: cc }}>
                    {c.valor.toFixed(0)}
                  </span>
                </div>
                <div className={styles.compTrack}>
                  <div
                    className={styles.compFill}
                    style={{ width: `${Math.min(100, Math.max(0, c.valor))}%`, background: cc }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

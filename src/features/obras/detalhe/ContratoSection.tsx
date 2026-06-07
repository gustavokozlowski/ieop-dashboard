import { useState } from "react";
import { formatBRL, formatDate } from "../formatters";
import styles from "./ContratoSection.module.css";
import type { ContratoVinculado } from "./types";
import { ADITIVO_TIPO_LABELS } from "./types";

interface ContratoSectionProps {
  contratos: ContratoVinculado[];
}

export function ContratoSection({ contratos }: ContratoSectionProps) {
  const [open, setOpen] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Contratos vinculados</span>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
          {contratos.length} {contratos.length === 1 ? "contrato" : "contratos"}
        </span>
      </div>

      {contratos.length === 0 ? (
        <div className={styles.empty}>Nenhum contrato vinculado.</div>
      ) : (
        contratos.map((c) => {
          const isOpen = open.has(c.id);
          const totalAditivos = c.aditivos.reduce((s, a) => s + a.valor, 0);
          return (
            <div key={c.id} className={styles.contrato}>
              <div
                className={styles.contratoHeader}
                onClick={() => toggle(c.id)}
                aria-expanded={isOpen}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && toggle(c.id)}
              >
                <span className={`${styles.chevron} ${isOpen ? styles.open : ""}`}>›</span>
                <span className={styles.contratoNum}>{c.numero}</span>
                <span className={styles.contratoObjeto} title={c.objeto}>
                  {c.objeto}
                </span>
                <span className={styles.contratoValor}>
                  {formatBRL(c.valor_inicial + totalAditivos)}
                </span>
                <span
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--color-text-muted)",
                    flexShrink: 0,
                  }}
                >
                  {c.aditivos.length} {c.aditivos.length === 1 ? "aditivo" : "aditivos"}
                </span>
              </div>

              {isOpen && (
                <div className={styles.aditivosList}>
                  {c.aditivos.length === 0 ? (
                    <div
                      style={{
                        padding: "var(--space-4) var(--space-6)",
                        fontSize: "var(--text-xs)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      Nenhum aditivo.
                    </div>
                  ) : (
                    <>
                      <div className={styles.aditivoHeader}>
                        <span>Número</span>
                        <span>Tipo</span>
                        <span>Motivo</span>
                        <span>Valor</span>
                        <span>Prazo</span>
                        <span>Data</span>
                      </div>
                      {c.aditivos.map((a) => (
                        <div key={a.id} className={styles.aditivoRow}>
                          <span className={styles.aditivoNum}>{a.numero}</span>
                          <span>{ADITIVO_TIPO_LABELS[a.tipo]}</span>
                          <span className={styles.aditivoMotivo} title={a.motivo}>
                            {a.motivo}
                          </span>
                          <span>{a.valor > 0 ? formatBRL(a.valor) : "—"}</span>
                          <span>{a.prazo_dias > 0 ? `+${a.prazo_dias}d` : "—"}</span>
                          <span>{formatDate(a.data)}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

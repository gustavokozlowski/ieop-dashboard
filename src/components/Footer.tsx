import styles from "./Footer.module.css";

/** Rodapé assinado "team Serena" — decorativo, degradável sem prejuízo funcional. */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <Sparkle style={{ left: "32%", top: "30%" }} />
      <Sparkle style={{ right: "33%", top: "40%", animationDelay: "1.1s" }} />
      <Sparkle
        style={{ left: "38%", bottom: "26%", animationDelay: "2.1s", width: 10, height: 10 }}
      />
      <div className={styles.line}>
        <span className={styles.rule} />
        <span className={styles.by}>crafted with care by</span>
        <span className={`${styles.rule} ${styles.ruleR}`} />
      </div>
      <div className={styles.name}>
        team Serena <span className={styles.heart}>✦</span>
      </div>
      <div className={styles.sub}>
        <span className={styles.dot} /> IEOP · Índice de Eficiência de Obras Públicas ·{" "}
        {new Date().getFullYear()}
      </div>
    </footer>
  );
}

function Sparkle({ style }: { style: React.CSSProperties }) {
  return (
    <svg
      className={styles.spark}
      style={style}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0l2.4 7.2L21.6 9.6 14.4 12 12 19.2 9.6 12 2.4 9.6 9.6 7.2z" />
    </svg>
  );
}

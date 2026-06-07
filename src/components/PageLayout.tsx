import { type ReactNode, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuthContext } from "../auth/AuthContext";
import { PERFIL_LABELS } from "../schemas/auth.schema";
import { LogoIcon, LogoutIcon } from "./icons";
import { buildNav, type NavGroup } from "./nav";
import styles from "./PageLayout.module.css";

export type { NavItem } from "./nav";

interface PageLayoutProps {
  children: ReactNode;
  nav?: NavGroup[];
  pageTitle?: string;
  /** Migalha exibida acima do título (ex.: "Macaé / Painel analítico"). */
  breadcrumb?: string;
  headerRight?: ReactNode;
}

/** Iniciais para o avatar do usuário (ex.: "Gustavo K." → "GK"). */
function initials(nome: string): string {
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "··";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function PageLayout({ children, nav, pageTitle, breadcrumb, headerRight }: PageLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthContext();

  // Nav canônico, filtrado por perfil (ex.: readonly não vê o Agente IA).
  // A prop `nav` permite override pontual, mas o padrão vem do perfil.
  const groups = nav ?? buildNav(user?.perfil);

  // Fecha o drawer ao navegar (mobile)
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  return (
    <div className={styles.root}>
      {/* Overlay — só visível no mobile com drawer aberto */}
      <div
        className={`${styles.overlay} ${drawerOpen ? styles.overlayVisible : ""}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden
      />

      <aside
        className={`${styles.sidebar} ${drawerOpen ? styles.sidebarOpen : ""}`}
        aria-label="Navegação principal"
      >
        <div className={styles.logo}>
          <LogoIcon size={36} />
          <div className={styles.logoText}>
            <div className={styles.logoWord}>
              IE<b>OP</b>
            </div>
            <div className={styles.logoSub}>Macaé · RJ</div>
          </div>
        </div>

        <nav className={styles.nav}>
          {groups.map((group, gi) => (
            <div key={gi}>
              {group.label && <p className={styles.navLabel}>{group.label}</p>}
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
                  className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}
                >
                  {item.icon && (
                    <span className={styles.navIcon} aria-hidden>
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                  {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {user && (
          <div className={styles.user}>
            <div className={styles.avatar} aria-hidden>
              {initials(user.nome)}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName} title={user.nome}>
                {user.nome}
              </div>
              <div className={styles.userRole}>{PERFIL_LABELS[user.perfil]}</div>
            </div>
            <button type="button" className={styles.logout} onClick={logout} aria-label="Sair">
              <LogoutIcon />
            </button>
          </div>
        )}
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              className={styles.hamburger}
              onClick={() => setDrawerOpen((o) => !o)}
              aria-label={drawerOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={drawerOpen}
            >
              {drawerOpen ? "✕" : "☰"}
            </button>
            <div className={styles.headerTitles}>
              {breadcrumb && <span className={styles.crumb}>{breadcrumb}</span>}
              <span className={styles.pageTitle}>{pageTitle}</span>
            </div>
          </div>
          <div className={styles.headerRight}>{headerRight}</div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}

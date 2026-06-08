import { Suspense } from "react";
import { LockIcon } from "../components/icons";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { lazyWithReload } from "../components/lazyWithReload";
import { PageLayout } from "../components/PageLayout";
import { useAuthContext } from "./AuthContext";
import { canManageUsers } from "./permissions";

// Backoffice carregado só para admin (e sob demanda).
const AdminUsuariosPage = lazyWithReload(() =>
  import("../pages/AdminUsuariosPage").then((m) => ({ default: m.AdminUsuariosPage })),
);

// Guarda a rota /admin: só perfil `admin` acessa o backoffice. Os demais
// recebem uma mensagem de acesso restrito — nunca o formulário de criação.
export function AdminRoute() {
  const { user } = useAuthContext();

  if (!canManageUsers(user?.perfil)) {
    return (
      <PageLayout pageTitle="Administração" breadcrumb="Macaé / Administração">
        <div
          role="alert"
          style={{
            maxWidth: 520,
            margin: "var(--space-12) auto",
            padding: "var(--space-8)",
            textAlign: "center",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <LockIcon
            size={32}
            aria-hidden
            style={{
              display: "block",
              margin: "0 auto var(--space-3)",
              color: "var(--color-text-muted)",
            }}
          />
          <h2
            style={{
              fontSize: "var(--text-lg)",
              fontWeight: "var(--font-bold)",
              color: "var(--color-text-primary)",
              marginBottom: "var(--space-2)",
            }}
          >
            Acesso restrito
          </h2>
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--color-text-muted)",
              lineHeight: 1.6,
            }}
          >
            A área administrativa é exclusiva de administradores. Fale com um administrador se
            precisar de acesso.
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <Suspense fallback={<LoadingSpinner size="lg" label="Carregando administração…" fullPage />}>
      <AdminUsuariosPage />
    </Suspense>
  );
}

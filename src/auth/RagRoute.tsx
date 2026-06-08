import { Suspense } from "react";
import { LockIcon } from "../components/icons";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { lazyWithReload } from "../components/lazyWithReload";
import { PageLayout } from "../components/PageLayout";
import { useAuthContext } from "./AuthContext";
import { canUseRAG } from "./permissions";

// O chat (markdown/streaming) só carrega para quem tem acesso ao RAG.
const ChatPage = lazyWithReload(() =>
  import("../pages/ChatPage").then((m) => ({ default: m.ChatPage })),
);

// Guarda a rota /ia: só perfis com permissão (admin/gestor) acessam o RAG.
// readonly recebe uma mensagem de acesso restrito (não a tela do chat).
export function RagRoute() {
  const { user } = useAuthContext();

  if (!canUseRAG(user?.perfil)) {
    return (
      <PageLayout pageTitle="Agente IA" breadcrumb="Macaé / Assistente RAG">
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
            Seu perfil não tem permissão para usar o assistente de IA (RAG). Fale com um
            administrador para solicitar acesso.
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <Suspense fallback={<LoadingSpinner size="lg" label="Carregando assistente…" fullPage />}>
      <ChatPage />
    </Suspense>
  );
}

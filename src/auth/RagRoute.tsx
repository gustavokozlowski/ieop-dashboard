import { PageLayout } from "../components/PageLayout";
import { ChatPage } from "../pages/ChatPage";
import { useAuthContext } from "./AuthContext";
import { canUseRAG } from "./permissions";

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
          <div style={{ fontSize: "2rem", marginBottom: "var(--space-3)" }} aria-hidden>
            🔒
          </div>
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

  return <ChatPage />;
}

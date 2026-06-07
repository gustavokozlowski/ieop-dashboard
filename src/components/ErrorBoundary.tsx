import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  override render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div
            role="alert"
            style={{
              padding: "2rem",
              color: "var(--color-danger)",
              background: "var(--color-danger-bg)",
              border: "1px solid var(--color-danger-border)",
              borderRadius: "var(--radius-lg)",
              margin: "2rem",
            }}
          >
            <strong>Algo deu errado</strong>
            <pre
              style={{
                marginTop: "0.5rem",
                fontSize: "0.8rem",
                opacity: 0.8,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {this.state.error.message}
            </pre>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

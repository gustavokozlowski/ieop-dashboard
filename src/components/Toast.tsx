import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./Toast.module.css";

type ToastType = "error" | "warning";

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  detail?: string;
  dedupeKey: string;
}

interface ApiErrorDetail {
  status: number;
  url: string;
  method: string;
}

function makeId() {
  return Math.random().toString(36).slice(2);
}

function messageForStatus(status: number): { title: string; detail: string } {
  if (status >= 500 && status < 600)
    return { title: "Erro no servidor", detail: `HTTP ${status} — tente novamente em instantes.` };
  return { title: "Erro na requisição", detail: `HTTP ${status}` };
}

function ToastEntry({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  return (
    <div className={`${styles.toast} ${styles[toast.type]}`} role="alert" aria-live="assertive">
      <span className={styles.icon} aria-hidden>
        {toast.type === "error" ? "⚠" : "⚡"}
      </span>
      <div className={styles.body}>
        <p className={styles.title}>{toast.title}</p>
        {toast.detail && <p className={styles.detail}>{toast.detail}</p>}
      </div>
      <button
        className={styles.closeBtn}
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Fechar notificação"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    function handleApiError(e: Event) {
      const { status, url, method } = (e as CustomEvent<ApiErrorDetail>).detail;
      const { title, detail } = messageForStatus(status);
      const dedupeKey = `${status}:${method}:${url}`;
      const id = makeId();

      setToasts((prev) => {
        // Ignora toasts idênticos já visíveis (ex.: StrictMode dispara 2×)
        if (prev.some((t) => t.dedupeKey === dedupeKey)) return prev;
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), 6_000),
        );
        return [
          ...prev,
          {
            id,
            type: "error",
            title,
            detail: `${method.toUpperCase()} ${url} — ${detail}`,
            dedupeKey,
          },
        ];
      });
    }

    window.addEventListener("api:error", handleApiError);
    return () => window.removeEventListener("api:error", handleApiError);
  }, [dismiss]);

  // Clean up timers on unmount
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  if (toasts.length === 0) return null;

  return createPortal(
    <div className={styles.container} aria-label="Notificações">
      {toasts.map((t) => (
        <ToastEntry key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>,
    document.body,
  );
}

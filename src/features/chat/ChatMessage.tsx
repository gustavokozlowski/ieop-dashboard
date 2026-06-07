import { useState } from "react";
import styles from "./ChatMessage.module.css";
import { SourceCard } from "./SourceCard";
import type { Message } from "./types";

function formatTime(d: Date): string {
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

interface ChatMessageProps {
  message: Message;
  anchorRef?: (el: HTMLDivElement | null) => void;
}

export function ChatMessage({ message, anchorRef }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback: do nothing */
    }
  }

  return (
    <div ref={anchorRef} className={`${styles.message} ${isUser ? styles.user : styles.assistant}`}>
      <div className={styles.avatar} aria-hidden>
        {isUser ? "Você" : "IA"}
      </div>

      <div className={styles.bubble}>
        <div className={styles.content}>
          {message.content || (message.isStreaming ? "" : "—")}
          {message.isStreaming && <span className={styles.cursor} aria-hidden />}
        </div>

        {!isUser && (
          <div className={styles.actions}>
            {!message.isStreaming && message.content && (
              <button
                className={`${styles.copyBtn} ${copied ? styles.copied : ""}`}
                onClick={handleCopy}
                title="Copiar resposta"
                aria-label="Copiar resposta"
              >
                {copied ? "✓ Copiado" : "⎘ Copiar"}
              </button>
            )}
            <span className={styles.timestamp}>{formatTime(message.timestamp)}</span>
          </div>
        )}

        {!isUser && message.sources && message.sources.length > 0 && (
          <SourceCard sources={message.sources} />
        )}
      </div>
    </div>
  );
}

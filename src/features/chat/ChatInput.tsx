import { type FormEvent, useRef } from "react";
import styles from "./ChatInput.module.css";

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onAbort: () => void;
  isLoading: boolean;
}

export function ChatInput({ value, onChange, onSend, onAbort, isLoading }: ChatInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function adjustHeight() {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value);
    adjustHeight();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && value.trim()) onSend();
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isLoading && value.trim()) onSend();
  }

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit}>
        <div className={styles.row}>
          <textarea
            ref={ref}
            className={styles.textarea}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Faça uma pergunta sobre obras e contratos…"
            rows={1}
            disabled={isLoading && !value}
            aria-label="Campo de pergunta"
          />

          {isLoading ? (
            <button
              type="button"
              className={styles.abortBtn}
              onClick={onAbort}
              aria-label="Parar geração"
            >
              ⏹ Parar
            </button>
          ) : (
            <button
              type="submit"
              className={styles.sendBtn}
              disabled={!value.trim()}
              aria-label="Enviar pergunta"
            >
              Enviar ↩
            </button>
          )}
        </div>
      </form>
      <p className={styles.hint}>Enter para enviar · Shift+Enter para nova linha</p>
    </div>
  );
}

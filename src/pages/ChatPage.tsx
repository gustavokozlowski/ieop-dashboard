import { useCallback, useEffect, useRef, useState } from "react";
import { PageLayout } from "../components/PageLayout";
import { ChatInput } from "../features/chat/ChatInput";
import { ChatMessage } from "../features/chat/ChatMessage";
import { SessionHistory } from "../features/chat/SessionHistory";
import { SuggestionList } from "../features/chat/SuggestionList";
import { useChat } from "../features/chat/useChat";
import styles from "./ChatPage.module.css";

export function ChatPage() {
  const { messages, userMessages, isLoading, error, sendMessage, abort, clearHistory } = useChat();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Auto-scroll to bottom on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const q = input.trim();
    if (!q) return;
    setInput("");
    sendMessage(q);
  }

  function handleSuggestion(text: string) {
    setInput(text);
    sendMessage(text);
    setInput("");
  }

  const scrollTo = useCallback((id: string) => {
    messageRefs.current.get(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const hasMessages = messages.length > 0;

  return (
    <PageLayout pageTitle="Agente IA" breadcrumb="Macaé / Assistente RAG">
      <div className={styles.container}>
        {/* Sidebar: session history (visible when there are messages) */}
        {hasMessages && (
          <SessionHistory
            userMessages={userMessages}
            onScrollTo={scrollTo}
            onClear={clearHistory}
          />
        )}

        {/* Main chat area */}
        <div className={styles.main}>
          <div className={styles.messagesArea} role="log" aria-live="polite" aria-label="Conversa">
            {!hasMessages ? (
              <div className={styles.welcome}>
                <span className={styles.welcomeIcon} aria-hidden>
                  ✦
                </span>
                <h2 className={styles.welcomeTitle}>Agente RAG — Obras e Contratos</h2>
                <p className={styles.welcomeSubtitle}>
                  Consulte obras, contratos e fornecedores em linguagem natural. As respostas são
                  fundamentadas nos documentos oficiais do sistema.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  anchorRef={(el) => {
                    if (el) messageRefs.current.set(msg.id, el);
                    else messageRefs.current.delete(msg.id);
                  }}
                />
              ))
            )}

            {/* Loading dots — shown while waiting for first chunk */}
            {isLoading && messages.at(-1)?.role === "assistant" && !messages.at(-1)?.content && (
              <div className={styles.loadingDots} aria-label="Processando resposta…">
                <div className={styles.dot} />
                <div className={styles.dot} />
                <div className={styles.dot} />
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Error banner */}
          {error && (
            <div className={styles.errorBanner} role="alert">
              <span aria-hidden>⚠</span>
              {error}
            </div>
          )}

          {/* Suggestion chips — shown when empty or below input */}
          {!hasMessages && <SuggestionList onSelect={handleSuggestion} disabled={isLoading} />}

          {/* Input */}
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            onAbort={abort}
            isLoading={isLoading}
          />
        </div>
      </div>
    </PageLayout>
  );
}

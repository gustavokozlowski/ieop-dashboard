import { useCallback, useRef, useState } from "react";
import { postConsulta } from "../../services/ia";
import type { Message, Source } from "./types";

let counter = 0;
function genId() {
  return `msg-${Date.now()}-${++counter}`;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(new AbortController());

  const appendContent = useCallback((id: string, text: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content: m.content + text } : m)));
  }, []);

  const setSources = useCallback((id: string, sources: Source[]) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, sources } : m)));
  }, []);

  const finishStreaming = useCallback((id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isStreaming: false } : m)));
  }, []);

  const sendMessage = useCallback(
    async (pergunta: string) => {
      if (isLoading || !pergunta.trim()) return;

      const userMsgId = genId();
      const assistantMsgId = genId();

      setMessages((prev) => [
        ...prev,
        { id: userMsgId, role: "user", content: pergunta, timestamp: new Date() },
        {
          id: assistantMsgId,
          role: "assistant",
          content: "",
          isStreaming: true,
          timestamp: new Date(),
        },
      ]);
      setIsLoading(true);
      setError(null);
      abortRef.current = new AbortController();

      try {
        // Consume the async generator from services/ia
        for await (const chunk of postConsulta(pergunta, abortRef.current.signal)) {
          if (chunk.type === "content" && "text" in chunk && chunk.text) {
            appendContent(assistantMsgId, chunk.text);
          } else if (chunk.type === "sources" && "sources" in chunk) {
            setSources(assistantMsgId, chunk.sources);
          } else if (chunk.type === "error" && "message" in chunk) {
            throw new Error(chunk.message);
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const msg = err instanceof Error ? err.message : "Erro desconhecido";
        setError(msg);
        setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId));
      } finally {
        finishStreaming(assistantMsgId);
        setIsLoading(false);
      }
    },
    [isLoading, appendContent, setSources, finishStreaming],
  );

  const abort = useCallback(() => {
    abortRef.current.abort();
    setIsLoading(false);
    setMessages((prev) => prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m)));
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const userMessages = messages.filter((m) => m.role === "user");

  return { messages, userMessages, isLoading, error, sendMessage, abort, clearHistory };
}

export type MessageRole = "user" | "assistant";

export interface Source {
  id: string;
  titulo: string; // e.g. "Contrato nº 001/2024"
  trecho: string; // excerpt from the document
  obra?: string;
  relevancia: number; // 0–1
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  sources?: Source[];
  isStreaming?: boolean;
  timestamp: Date;
}

// SSE events from the server
export type SSEEvent =
  | { type: "content"; text: string }
  | { type: "sources"; sources: Source[] }
  | { type: "error"; message: string }
  | { type: "done" };

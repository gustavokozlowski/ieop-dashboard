/**
 * Serviço de IA: consulta RAG.
 *
 * Usa o endpoint NÃO-streaming (POST /api/v1/ia/consulta), que devolve a
 * resposta completa em JSON ({ resposta, modelo }). O endpoint de streaming
 * (/consulta/stream) emite tokens de texto cru cujo conteúdo contém `\n\n`
 * (markdown) — o mesmo separador usado entre eventos SSE —, o que torna o
 * stream ambíguo/impossível de parsear sem perder conteúdo. Por isso optamos
 * pela resposta completa, que é íntegra.
 *
 * A interface continua sendo um async generator (1 chunk) para manter o
 * contrato com useChat (que renderiza eventos SSEEvent).
 */

import { getAccessToken } from "../auth/tokenStore";
import type { SSEEvent } from "../features/chat/types";
import { BASE_URL } from "./api";

export type { SSEEvent };

interface ConsultaResponse {
  resposta: string;
  modelo: string | null;
}

export async function* postConsulta(
  pergunta: string,
  signal?: AbortSignal,
): AsyncGenerator<SSEEvent> {
  const res = await fetch(`${BASE_URL}/api/v1/ia/consulta`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken() ?? ""}`,
    },
    body: JSON.stringify({ pergunta }),
    signal,
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} — ${res.statusText}`);
  }

  const data = (await res.json()) as ConsultaResponse;
  if (data.resposta) {
    yield { type: "content", text: data.resposta };
  }
}

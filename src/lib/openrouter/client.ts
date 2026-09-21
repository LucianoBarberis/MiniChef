import { mapHttpStatusToError, OpenRouterError } from './errors.ts'

/** Single change point for the generation model. No picker in v1. */
export const DEFAULT_MODEL = 'openai/gpt-4o-mini'

export const REQUEST_TIMEOUT_MS = 30_000

const COMPLETIONS_URL = 'https://openrouter.ai/api/v1/chat/completions'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface CompletionChoice {
  message?: { content?: unknown }
}

interface CompletionResponse {
  choices?: CompletionChoice[]
}

/**
 * Fixed-model completion call. Throws OpenRouterError with a Spanish
 * message for every failure (HTTP, offline, timeout, bad output).
 */
export async function requestCompletion(params: {
  apiKey: string
  messages: ChatMessage[]
  signal?: AbortSignal
}): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  const forwardAbort = (): void => controller.abort()
  params.signal?.addEventListener('abort', forwardAbort)

  try {
    const response = await fetch(COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${params.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: params.messages,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    })
    if (!response.ok) {
      throw new OpenRouterError(mapHttpStatusToError(response.status), response.status)
    }
    const data = (await response.json()) as CompletionResponse
    const content = data.choices?.[0]?.message?.content
    if (typeof content !== 'string' || content.length === 0) {
      throw new OpenRouterError('bad-output')
    }
    return content
  } catch (error) {
    if (error instanceof OpenRouterError) throw error
    if (error instanceof TypeError) throw new OpenRouterError('offline')
    throw new OpenRouterError('unknown')
  } finally {
    clearTimeout(timeout)
    params.signal?.removeEventListener('abort', forwardAbort)
  }
}

export { OpenRouterError }

import { useCallback, useState } from 'react'
import { OpenRouterError, requestCompletion } from '../../lib/openrouter/client.ts'
import type { ApiError } from '../../lib/openrouter/errors.ts'
import { parseGenerationPayload, type GenerationPayload } from '../../lib/openrouter/recipeSchema.ts'
import {
  buildGenerationMessages,
  buildRepairMessages,
  type GenerationFilters,
} from '../../lib/prompt/builders.ts'
import type { Ingredient } from '../../lib/storage/ingredients.ts'

export type GenerationStatus = 'idle' | 'loading' | 'success' | 'error'

export interface GenerationInput {
  apiKey: string
  ingredients: Ingredient[]
  filters: GenerationFilters
}

/** JSON.parse + zod caps. Null means "retry once or fail with bad-output". */
function tryParsePayload(raw: string): GenerationPayload | null {
  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    return null
  }
  const result = parseGenerationPayload(json)
  return result.success ? result.data : null
}

/**
 * Fixed-model generation with client-side cap validation and exactly one
 * repair retry. Precondition: non-empty apiKey; UI blocks empty ingredients
 * and missing keys before calling generate().
 */
export function useGeneration() {
  const [status, setStatus] = useState<GenerationStatus>('idle')
  const [payload, setPayload] = useState<GenerationPayload | null>(null)
  const [error, setError] = useState<ApiError | null>(null)

  const fail = (kind: ApiError): void => {
    setError(kind)
    setStatus('error')
  }

  const generate = useCallback(async (input: GenerationInput): Promise<void> => {
    if (input.apiKey.trim() === '') {
      fail('invalid-key')
      return
    }
    setStatus('loading')
    setError(null)
    const messages = buildGenerationMessages(input.ingredients, input.filters)
    try {
      const raw = await requestCompletion({ apiKey: input.apiKey, messages })
      const parsed = tryParsePayload(raw)
      if (parsed !== null) {
        setPayload(parsed)
        setStatus('success')
        return
      }
      const retryRaw = await requestCompletion({
        apiKey: input.apiKey,
        messages: buildRepairMessages(messages, raw),
      })
      const repaired = tryParsePayload(retryRaw)
      if (repaired !== null) {
        setPayload(repaired)
        setStatus('success')
        return
      }
      throw new OpenRouterError('bad-output')
    } catch (thrown) {
      if (thrown instanceof OpenRouterError) fail(thrown.kind)
      else fail('unknown')
    }
  }, [])

  const reset = useCallback((): void => {
    setStatus('idle')
    setPayload(null)
    setError(null)
  }, [])

  return { status, payload, error, generate, reset }
}

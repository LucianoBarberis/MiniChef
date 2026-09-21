import { afterEach, describe, expect, it, vi } from 'vitest'
import { requestCompletion } from '../lib/openrouter/client.ts'
import { API_ERROR_MESSAGES, mapHttpStatusToError, OpenRouterError } from '../lib/openrouter/errors.ts'
import { parseGenerationPayload } from '../lib/openrouter/recipeSchema.ts'

function strictRecipe(id: string, missing: string[] = []) {
  return {
    id,
    title: `Receta ${id}`,
    timeMin: 20,
    servings: 2,
    owned: ['huevo'],
    missing,
    steps: ['Batir.', 'Servir.'],
    strict: true,
  }
}

function flexibleRecipe(id: string, missing: string[]) {
  return { ...strictRecipe(id, missing), strict: false }
}

describe('error mapper', () => {
  it('maps auth and billing statuses to distinct kinds', () => {
    expect(mapHttpStatusToError(401)).toBe('invalid-key')
    expect(mapHttpStatusToError(402)).toBe('no-credit')
    expect(mapHttpStatusToError(429)).toBe('rate-limit')
    expect(mapHttpStatusToError(500)).toBe('unknown')
  })

  it('carries a distinct Spanish message per kind', () => {
    const messages = Object.values(API_ERROR_MESSAGES)
    expect(messages).toHaveLength(6)
    expect(new Set(messages).size).toBe(6)
    for (const message of messages) expect(message.length).toBeGreaterThan(10)
    expect(new OpenRouterError('invalid-key').message).toBe(API_ERROR_MESSAGES['invalid-key'])
  })
})

describe('generation payload schema', () => {
  it('accepts a valid hybrid payload', () => {
    const result = parseGenerationPayload({
      strict: [strictRecipe('s1')],
      flexible: [flexibleRecipe('f1', ['cebolla'])],
    })
    expect(result.success).toBe(true)
  })

  it('truncates more than 5 strict recipes to 5', () => {
    const result = parseGenerationPayload({
      strict: Array.from({ length: 6 }, (_, i) => strictRecipe(`s${i}`)),
      flexible: [],
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.strict).toHaveLength(5)
  })

  it('truncates more than 3 flexible recipes to 3', () => {
    const result = parseGenerationPayload({
      strict: [],
      flexible: Array.from({ length: 4 }, (_, i) => flexibleRecipe(`f${i}`, ['sal'])),
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.flexible).toHaveLength(3)
  })

  it('re-buckets a strict-flagged recipe with missing ingredients into flexible', () => {
    const result = parseGenerationPayload({
      strict: [strictRecipe('s1', ['cebolla'])],
      flexible: [],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.strict).toHaveLength(0)
      expect(result.data.flexible).toHaveLength(1)
      expect(result.data.flexible[0]?.strict).toBe(false)
    }
  })

  it('re-buckets a flexible-flagged recipe with zero missing into strict', () => {
    expect(
      parseGenerationPayload({ strict: [], flexible: [flexibleRecipe('f1', [])] }).success,
    ).toBe(true)
    expect(
      parseGenerationPayload({ strict: [], flexible: [flexibleRecipe('f1', ['a', 'b', 'c'])] })
        .success,
    ).toBe(false)
  })

  it('parses fenced JSON model output', () => {
    const raw = '```json\n' + JSON.stringify({ strict: [strictRecipe('s1')], flexible: [] }) + '\n```'
    const result = parseGenerationPayload(raw)
    expect(result.success).toBe(true)
  })

  it('parses prose-wrapped JSON model output', () => {
    const raw =
      'Here are your recipes: ' +
      JSON.stringify({ strict: [strictRecipe('s1')], flexible: [] }) +
      ' Enjoy!'
    const result = parseGenerationPayload(raw)
    expect(result.success).toBe(true)
  })

  it('coerces numeric strings for timeMin and servings', () => {
    const recipe = { ...strictRecipe('s1'), timeMin: '20', servings: '2' }
    const result = parseGenerationPayload({ strict: [recipe], flexible: [] })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.strict[0]?.timeMin).toBe(20)
      expect(result.data.strict[0]?.servings).toBe(2)
    }
  })
})

describe('requestCompletion', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('returns the message content on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: '{"strict":[]}' } }] }),
      }),
    )
    await expect(
      requestCompletion({ apiKey: 'sk-or-test', messages: [{ role: 'user', content: 'hola' }] }),
    ).resolves.toBe('{"strict":[]}')
  })

  it('maps a 401 to invalid-key', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }))
    const failure = await requestCompletion({
      apiKey: 'bad',
      messages: [{ role: 'user', content: 'hola' }],
    }).catch((error: unknown) => error)
    expect(failure).toBeInstanceOf(OpenRouterError)
    expect((failure as OpenRouterError).kind).toBe('invalid-key')
  })

  it('maps a network TypeError to offline', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')))
    const failure = await requestCompletion({
      apiKey: 'sk-or-test',
      messages: [{ role: 'user', content: 'hola' }],
    }).catch((error: unknown) => error)
    expect((failure as OpenRouterError).kind).toBe('offline')
  })
})

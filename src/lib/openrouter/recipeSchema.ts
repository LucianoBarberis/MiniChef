import { z } from 'zod'

/** Single recipe returned by the model. Caps enforced by generationPayloadSchema. */
export const recipeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  timeMin: z.coerce.number().positive(),
  servings: z.coerce.number().positive(),
  owned: z.array(z.string()),
  missing: z.array(z.string()).max(2),
  steps: z.array(z.string().min(1)).min(1),
  strict: z.boolean(),
})

export type Recipe = z.infer<typeof recipeSchema>

const strictRecipeSchema = recipeSchema.extend({
  strict: z.literal(true),
  missing: z.array(z.string()).length(0),
})

const flexibleRecipeSchema = recipeSchema.extend({
  strict: z.literal(false),
  missing: z.array(z.string()).min(1).max(2),
})

/**
 * Hybrid result contract: at most 5 strict (zero missing) + at most 3
 * flexible (1–2 missing). Excess or malformed payloads fail validation
 * and must never render unchecked.
 */
export const generationPayloadSchema = z.object({
  strict: z.array(strictRecipeSchema).max(5),
  flexible: z.array(flexibleRecipeSchema).max(3),
})

export type GenerationPayload = z.infer<typeof generationPayloadSchema>

const MAX_STRICT = 5
const MAX_FLEXIBLE = 3

/** Strip markdown fences (```json ... ```) leaving the inner text. */
function stripFences(text: string): string {
  if (!text.includes('```')) return text
  return text
    .replace(/```(?:json)?/gi, '')
    .replace(/```/g, '')
    .trim()
}

/**
 * Extract the first balanced top-level JSON object from text, tolerating
 * surrounding prose and string-escaped braces.
 */
export function extractJsonObjectText(raw: string): string | null {
  const text = stripFences(raw).trim()
  const start = text.indexOf('{')
  if (start === -1) return null
  let depth = 0
  let inString = false
  let escaped = false
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (inString) {
      if (escaped) {
        escaped = false
      } else if (ch === '\\') {
        escaped = true
      } else if (ch === '"') {
        inString = false
      }
      continue
    }
    if (ch === '"') {
      inString = true
    } else if (ch === '{') {
      depth += 1
    } else if (ch === '}') {
      depth -= 1
      if (depth === 0) return text.slice(start, i + 1)
    }
  }
  return null
}

function coercePositiveNumber(value: unknown): unknown {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') return value
    const num = Number(trimmed)
    if (Number.isFinite(num)) return num
  }
  return value
}

/** Normalize one recipe-like item: coerce numeric strings, derive strict. */
function normalizeRecipe(item: unknown): unknown {
  if (typeof item !== 'object' || item === null || Array.isArray(item)) return item
  const record = item as Record<string, unknown>
  const missing = Array.isArray(record['missing']) ? (record['missing'] as unknown[]) : null
  const normalized: Record<string, unknown> = {
    ...record,
    timeMin: coercePositiveNumber(record['timeMin']),
    servings: coercePositiveNumber(record['servings']),
  }
  if (missing !== null) normalized['strict'] = missing.length === 0
  return normalized
}

/**
 * Tolerant normalization before final validation: re-bucket every recipe
 * by missing.length (source of truth for strict) and truncate over-cap
 * arrays. Final safeParse still gates everything.
 */
function normalizePayload(value: unknown): unknown {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return value
  const record = value as Record<string, unknown>
  const strictRaw = Array.isArray(record['strict']) ? (record['strict'] as unknown[]) : null
  const flexibleRaw = Array.isArray(record['flexible'])
    ? (record['flexible'] as unknown[])
    : null
  if (strictRaw === null && flexibleRaw === null) return value
  const candidates = [...(strictRaw ?? []), ...(flexibleRaw ?? [])].map(normalizeRecipe)
  const strict: unknown[] = []
  const flexible: unknown[] = []
  for (const candidate of candidates) {
    if (typeof candidate !== 'object' || candidate === null || Array.isArray(candidate)) {
      flexible.push(candidate)
      continue
    }
    const missing = (candidate as Record<string, unknown>)['missing']
    if (Array.isArray(missing) && missing.length === 0) strict.push(candidate)
    else flexible.push(candidate)
  }
  return {
    ...record,
    strict: strict.slice(0, MAX_STRICT),
    flexible: flexible.slice(0, MAX_FLEXIBLE),
  }
}

function failure(): z.ZodSafeParseResult<GenerationPayload> {
  return generationPayloadSchema.safeParse(undefined)
}

/**
 * Hardened parser: accepts model text (fenced / prose-wrapped JSON) or an
 * already-parsed value, normalizes tolerantly, then gates with safeParse.
 */
export function parseGenerationPayload(raw: unknown): z.ZodSafeParseResult<GenerationPayload> {
  if (typeof raw === 'string') {
    const extracted = extractJsonObjectText(raw)
    if (extracted === null) return failure()
    let parsed: unknown
    try {
      parsed = JSON.parse(extracted) as unknown
    } catch {
      return failure()
    }
    return generationPayloadSchema.safeParse(normalizePayload(parsed))
  }
  return generationPayloadSchema.safeParse(normalizePayload(raw))
}

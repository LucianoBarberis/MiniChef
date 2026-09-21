import { z } from 'zod'

/** Single recipe returned by the model. Caps enforced by generationPayloadSchema. */
export const recipeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  timeMin: z.number().positive(),
  servings: z.number().positive(),
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

export function parseGenerationPayload(raw: unknown): z.ZodSafeParseResult<GenerationPayload> {
  return generationPayloadSchema.safeParse(raw)
}

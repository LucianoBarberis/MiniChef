import type { ChatMessage } from '../openrouter/client.ts'
import type { Ingredient } from '../storage/ingredients.ts'

/** Pre-request filters. Defaults keep generation never blocked. */
export interface GenerationFilters {
  maxTimeMin: number
  servings: number
}

export const DEFAULT_FILTERS: GenerationFilters = { maxTimeMin: 30, servings: 2 }

export const MAX_STRICT_RECIPES = 5
export const MAX_FLEXIBLE_RECIPES = 3

/** System message: pins the JSON contract + filters as hard constraints. */
export function buildSystemPrompt(): string {
  return [
    'Sos MiniChef, un asistente de cocina. Respondés SOLO con JSON válido, sin texto adicional.',
    `Devolvé un objeto con exactamente dos claves: "strict" (hasta ${MAX_STRICT_RECIPES} recetas que usan SOLO los ingredientes dados, 0 faltantes) y "flexible" (hasta ${MAX_FLEXIBLE_RECIPES} recetas que piden 1 o 2 ingredientes extra como máximo).`,
    'Cada receta tiene: id (texto, único), title, timeMin (minutos, entero), servings (porciones, entero), owned (ingredientes dados que usa), missing (estricta: [] y strict true; flexible: 1-2 nombres y strict false), steps (pasos ordenados, concretos y breves).',
    'El tiempo máximo y las porciones que te pasan son restricciones duras: devolvé SOLO recetas que las respeten. Si ninguna receta puede respetarlas, devolvé {"strict": [], "flexible": []} sin texto adicional.',
    'Respondé en español.',
  ].join('\n')
}

/** User message: `name amount unit` lines + filters. Filters always present. */
export function buildUserPrompt(ingredients: Ingredient[], filters: GenerationFilters): string {
  const lines = ingredients.map((item) => `- ${item.name} ${item.amount} ${item.unit}`)
  return [
    'Ingredientes disponibles:',
    ...lines,
    `Restricciones: tiempo máximo ${filters.maxTimeMin} minutos, ${filters.servings} porciones.`,
    `Devolvé hasta ${MAX_STRICT_RECIPES} recetas estrictas y hasta ${MAX_FLEXIBLE_RECIPES} flexibles en el JSON acordado.`,
  ].join('\n')
}

/** Repair instruction appended with the prior output for the single retry. */
export function buildRepairPrompt(priorOutput: string): string {
  return [
    'La respuesta anterior no fue un JSON válido según el esquema acordado.',
    'Respuesta anterior:',
    priorOutput.slice(0, 4000),
    'Devolvé SOLO el JSON corregido, sin texto adicional.',
  ].join('\n')
}

/** Base [system, user] pair for a generation request. */
export function buildGenerationMessages(
  ingredients: Ingredient[],
  filters: GenerationFilters,
): ChatMessage[] {
  return [
    { role: 'system', content: buildSystemPrompt() },
    { role: 'user', content: buildUserPrompt(ingredients, filters) },
  ]
}

/** Retry pair: base messages + assistant's bad output + repair instruction. */
export function buildRepairMessages(base: ChatMessage[], priorOutput: string): ChatMessage[] {
  return [
    ...base,
    { role: 'assistant', content: priorOutput.slice(0, 4000) },
    { role: 'user', content: buildRepairPrompt(priorOutput) },
  ]
}

import { describe, expect, it } from 'vitest'
import {
  buildGenerationMessages,
  buildRepairMessages,
  buildSystemPrompt,
  buildUserPrompt,
  DEFAULT_FILTERS,
} from './builders.ts'
import type { Ingredient } from '../storage/ingredients.ts'

const INGREDIENTS: Ingredient[] = [
  { id: 'a', name: 'tomate', amount: 3, unit: 'u' },
  { id: 'b', name: 'huevo', amount: 2, unit: 'u' },
]

describe('prompt builders', () => {
  it('pins strict/flexible caps and Spanish JSON-only contract in the system prompt', () => {
    const system = buildSystemPrompt()
    expect(system).toMatch(/hasta 5/)
    expect(system).toMatch(/hasta 3/)
    expect(system).toMatch(/SOLO con JSON válido/)
    expect(system).toMatch(/español/)
  })

  it('lists quantities as name/amount/unit lines and always includes filters', () => {
    const user = buildUserPrompt(INGREDIENTS, { maxTimeMin: 30, servings: 2 })
    expect(user).toContain('tomate 3 u')
    expect(user).toContain('huevo 2 u')
    expect(user).toContain('30 minutos')
    expect(user).toContain('2 porciones')
  })

  it('falls back to sensible defaults without blocking generation', () => {
    const user = buildUserPrompt(INGREDIENTS, DEFAULT_FILTERS)
    expect(user).toContain(`${DEFAULT_FILTERS.maxTimeMin} minutos`)
    expect(user).toContain(`${DEFAULT_FILTERS.servings} porciones`)
  })

  it('builds a system+user pair and a repair retry carrying the prior output', () => {
    const base = buildGenerationMessages(INGREDIENTS, DEFAULT_FILTERS)
    expect(base).toHaveLength(2)
    expect(base[0]?.role).toBe('system')
    expect(base[1]?.role).toBe('user')

    const bad = '{no valido'
    const retry = buildRepairMessages(base, bad)
    expect(retry).toHaveLength(4)
    expect(retry[2]?.role).toBe('assistant')
    expect(retry[3]?.role).toBe('user')
    expect(retry[3]?.content).toContain(bad)
    expect(retry[3]?.content).toMatch(/SOLO el JSON corregido/)
  })
})

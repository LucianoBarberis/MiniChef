import { useState } from 'react'
import { ingredientsStore, type Ingredient, type Unit } from '../../lib/storage/ingredients.ts'

export interface IngredientDraft {
  name: string
  amount: number
  unit: Unit | ''
}

export type IngredientProblem = 'empty-name' | 'duplicate' | 'invalid-quantity'

export const INGREDIENT_ERROR_MESSAGES: Record<IngredientProblem, string> = {
  'empty-name': 'Escribí el nombre del ingrediente.',
  duplicate: 'Ese ingrediente ya está en la lista.',
  'invalid-quantity': 'Indicá una cantidad mayor a cero y elegí la unidad.',
}

function findProblem(draft: IngredientDraft, existing: Ingredient[]): IngredientProblem | null {
  const name = draft.name.trim()
  if (name.length === 0) return 'empty-name'
  if (existing.some((item) => item.name.toLowerCase() === name.toLowerCase())) return 'duplicate'
  if (!Number.isFinite(draft.amount) || draft.amount <= 0 || draft.unit === '') {
    return 'invalid-quantity'
  }
  return null
}

/** Single-list CRUD with required structured quantity. Persists to localStorage. */
export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => ingredientsStore.load())
  const [error, setError] = useState<IngredientProblem | null>(null)

  const add = (draft: IngredientDraft): boolean => {
    const problem = findProblem(draft, ingredients)
    if (problem !== null) {
      setError(problem)
      return false
    }
    const next = [
      ...ingredients,
      {
        id: crypto.randomUUID(),
        name: draft.name.trim(),
        amount: draft.amount,
        unit: draft.unit as Unit,
      },
    ]
    setIngredients(next)
    ingredientsStore.save(next)
    setError(null)
    return true
  }

  const remove = (id: string): void => {
    const next = ingredients.filter((item) => item.id !== id)
    setIngredients(next)
    ingredientsStore.save(next)
  }

  return { ingredients, error, add, remove }
}

import { useEffect, useRef, useState } from 'react'
import { API_ERROR_MESSAGES } from '../../lib/openrouter/errors.ts'
import type { GenerationPayload, Recipe } from '../../lib/openrouter/recipeSchema.ts'
import { DEFAULT_FILTERS, type GenerationFilters } from '../../lib/prompt/builders.ts'
import type { Ingredient } from '../../lib/storage/ingredients.ts'
import { FilterBar } from './FilterBar.tsx'
import { RecipeCards } from './RecipeCards.tsx'
import { RecipeDetail } from './RecipeDetail.tsx'
import { useGeneration } from './useGeneration.ts'

interface GenerationSectionProps {
  ingredients: Ingredient[]
  apiKey: string | null
  onSuccess: (payload: GenerationPayload) => void
}

/** Filters → fixed-model generation → hybrid cards → detail modal. */
export function GenerationSection({ ingredients, apiKey, onSuccess }: GenerationSectionProps) {
  const [filters, setFilters] = useState<GenerationFilters>(DEFAULT_FILTERS)
  const [selected, setSelected] = useState<Recipe | null>(null)
  const { status, payload, error, generate } = useGeneration()
  const recorded = useRef<GenerationPayload | null>(null)

  useEffect(() => {
    if (status === 'success' && payload !== null && recorded.current !== payload) {
      recorded.current = payload
      onSuccess(payload)
    }
  }, [status, payload, onSuccess])

  const loading = status === 'loading'
  const blockedKey = apiKey === null
  const blockedIngredients = ingredients.length === 0

  const submit = (event: React.FormEvent): void => {
    event.preventDefault()
    if (blockedKey || blockedIngredients || loading) return
    void generate({ apiKey: apiKey ?? '', ingredients, filters })
  }

  return (
    <section aria-labelledby="recetas-titulo">
      <h2 id="recetas-titulo">Recetas</h2>
      <form onSubmit={submit}>
        <FilterBar filters={filters} onChange={setFilters} disabled={loading} />
        <button
          type="submit"
          disabled={blockedKey || blockedIngredients || loading}
        >
          {loading ? 'Generando…' : 'Generar recetas'}
        </button>
      </form>
      {blockedKey && <p>Guardá tu clave de OpenRouter para generar recetas.</p>}
      {!blockedKey && blockedIngredients && <p>Agregá al menos un ingrediente para generar.</p>}
      {error !== null && <p role="alert">{API_ERROR_MESSAGES[error]}</p>}
      <RecipeCards status={status} payload={payload} onSelect={setSelected} />
      <RecipeDetail recipe={selected} onClose={() => setSelected(null)} />
    </section>
  )
}

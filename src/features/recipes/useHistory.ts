import { useCallback, useState } from 'react'
import type { GenerationPayload } from '../../lib/openrouter/recipeSchema.ts'
import { favoritesStore, toggleFavorite } from '../../lib/storage/favorites.ts'
import { historyStore, type HistoryEntry, type StoredRecipe } from '../../lib/storage/history.ts'

/** Shared controller type so App can lift state across sections. */
export type HistoryController = ReturnType<typeof useHistory>

function toStoredRecipes(payload: GenerationPayload): StoredRecipe[] {
  return [...payload.strict, ...payload.flexible].map((recipe) => ({
    id: recipe.id,
    title: recipe.title,
    strict: recipe.strict,
  }))
}

function sameRun(a: StoredRecipe[], b: StoredRecipe[]): boolean {
  return a.length === b.length && a.every((recipe, index) => recipe.id === b[index]?.id)
}

/** History runs + favorite ids over versioned localStorage slices. */
export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => historyStore.load())
  const [favorites, setFavorites] = useState<string[]>(() => favoritesStore.load())

  const recordRun = useCallback((payload: GenerationPayload): void => {
    const recipes = toStoredRecipes(payload)
    setEntries((current) => {
      const last = current[0]
      if (last !== undefined && sameRun(last.recipes, recipes)) return current
      const next: HistoryEntry[] = [
        { id: crypto.randomUUID(), createdAt: new Date().toISOString(), recipes },
        ...current,
      ]
      historyStore.save(next)
      return next
    })
  }, [])

  const toggle = useCallback((id: string): void => {
    setFavorites((current) => {
      const next = toggleFavorite(current, id)
      favoritesStore.save(next)
      return next
    })
  }, [])

  return { entries, favorites, recordRun, toggleFavorite: toggle }
}

import { createVersionedStore } from './store.ts'

/** Favorite recipe ids. Unfavoriting removes the id; history is untouched. */
export const favoritesStore = createVersionedStore<string[]>('favorites', [])

export function toggleFavorite(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((fav) => fav !== id) : [...ids, id]
}

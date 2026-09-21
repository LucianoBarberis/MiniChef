import { createVersionedStore } from './store.ts'

/** Minimal persisted recipe snapshot. Extended by the generation slice. */
export interface StoredRecipe {
  id: string
  title: string
  strict: boolean
}

export interface HistoryEntry {
  id: string
  createdAt: string
  recipes: StoredRecipe[]
}

export const historyStore = createVersionedStore<HistoryEntry[]>('history', [])

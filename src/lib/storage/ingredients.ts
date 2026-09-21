import { createVersionedStore } from './store.ts'

export type Unit = 'u' | 'g' | 'kg' | 'ml' | 'l' | 'cda' | 'cdta' | 'taza'

export interface Ingredient {
  id: string
  name: string
  amount: number
  unit: Unit
}

export const ingredientsStore = createVersionedStore<Ingredient[]>('ingredients', [])

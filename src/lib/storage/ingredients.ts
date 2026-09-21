import { createVersionedStore } from './store.ts'

export type Unit = 'u' | 'g' | 'kg' | 'ml' | 'l' | 'cda' | 'cdta' | 'taza'

/** Single source for the unit list. UI imports this instead of redeclaring it. */
export const UNITS: Unit[] = ['u', 'g', 'kg', 'ml', 'l', 'cda', 'cdta', 'taza']

/** Spanish display names for unit codes shown in the UI. */
export const UNIT_LABELS: Record<Unit, string> = {
  u: 'unidades',
  g: 'gramos',
  kg: 'kilogramos',
  ml: 'mililitros',
  l: 'litros',
  cda: 'cucharadas',
  cdta: 'cucharaditas',
  taza: 'tazas',
}

export interface Ingredient {
  id: string
  name: string
  amount: number
  unit: Unit
}

export const ingredientsStore = createVersionedStore<Ingredient[]>('ingredients', [])

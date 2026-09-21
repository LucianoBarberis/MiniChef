import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { IngredientsSection } from '../features/ingredients/IngredientsSection.tsx'
import { useIngredients } from '../features/ingredients/useIngredients.ts'
import { ingredientsStore } from '../lib/storage/ingredients.ts'
import { suggestIngredients } from '../features/ingredients/staples.ts'

beforeEach(() => localStorage.clear())

function Harness() {
  const controller = useIngredients()
  return <IngredientsSection controller={controller} />
}

function addIngredient(name: string, amount: string, unit: string) {
  fireEvent.change(screen.getByPlaceholderText('Ej.: tomate'), { target: { value: name } })
  fireEvent.change(screen.getByPlaceholderText('Ej.: 3'), { target: { value: amount } })
  fireEvent.change(screen.getByLabelText(/Unidad/), { target: { value: unit } })
  fireEvent.click(screen.getByRole('button', { name: 'Agregar' }))
}

describe('IngredientsSection', () => {
  it('adds a chip and persists it to localStorage', () => {
    render(<Harness />)
    addIngredient('tomate', '3', 'u')
    expect(screen.getByText(/tomate 3 unidades/)).toBeInTheDocument()
    expect(ingredientsStore.load()).toHaveLength(1)
  })

  it('rejects duplicates case-insensitively with a Spanish error', () => {
    render(<Harness />)
    addIngredient('Tomate', '3', 'u')
    addIngredient('tomate', '1', 'u')
    expect(screen.getByRole('alert')).toHaveTextContent(/ya está en la lista/)
    expect(screen.getByLabelText('Tus ingredientes').children).toHaveLength(1)
  })

  it('rejects empty names and missing quantities', () => {
    render(<Harness />)
    addIngredient('   ', '2', 'g')
    expect(screen.getByRole('alert')).toHaveTextContent(/nombre del ingrediente/)
    addIngredient('sal', '', '')
    expect(screen.getByRole('alert')).toHaveTextContent(/cantidad/)
    expect(ingredientsStore.load()).toHaveLength(0)
  })

  it('accepts a suggestion, fills the name and focuses quantity', () => {
    render(<Harness />)
    fireEvent.change(screen.getByPlaceholderText('Ej.: tomate'), { target: { value: 'tom' } })
    fireEvent.click(screen.getByRole('button', { name: 'tomate' }))
    expect(screen.getByPlaceholderText('Ej.: tomate')).toHaveValue('tomate')
    expect(screen.getByPlaceholderText('Ej.: 3')).toHaveFocus()
  })

  it('removes a chip', () => {
    render(<Harness />)
    addIngredient('huevo', '2', 'u')
    fireEvent.click(screen.getByRole('button', { name: 'Quitar huevo' }))
    expect(screen.getByText(/Todavía no agregaste/)).toBeInTheDocument()
    expect(ingredientsStore.load()).toHaveLength(0)
  })
})

describe('suggestIngredients', () => {
  it('prefers past entries and caps at 6 without echoing the query', () => {
    const out = suggestIngredients('to', ['tomatillo', 'torta'])
    expect(out.slice(0, 2)).toEqual(['tomatillo', 'torta'])
    expect(out).not.toContain('to')
    expect(out.length).toBeLessThanOrEqual(6)
    expect(suggestIngredients('   ', [])).toEqual([])
  })
})

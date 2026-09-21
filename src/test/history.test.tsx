import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { HistorySection } from '../features/recipes/HistorySection.tsx'
import { useHistory } from '../features/recipes/useHistory.ts'
import { favoritesStore } from '../lib/storage/favorites.ts'
import { historyStore, type HistoryEntry } from '../lib/storage/history.ts'
import type { GenerationPayload } from '../lib/openrouter/recipeSchema.ts'

const ENTRY: HistoryEntry = {
  id: 'run-1',
  createdAt: '2026-09-21T12:00:00.000Z',
  recipes: [
    { id: 's1', title: 'Tortilla simple', strict: true },
    { id: 'f1', title: 'Arroz con cebolla', strict: false },
  ],
}

const PAYLOAD: GenerationPayload = {
  strict: [
    {
      id: 's9',
      title: 'Huevo revuelto',
      timeMin: 10,
      servings: 1,
      owned: ['huevo'],
      missing: [],
      steps: ['Batir.', 'Cocinar.'],
      strict: true,
    },
  ],
  flexible: [],
}

function Harness() {
  const controller = useHistory()
  return <HistorySection controller={controller} />
}

function RecordHarness() {
  const controller = useHistory()
  return (
    <div>
      <button type="button" onClick={() => controller.recordRun(PAYLOAD)}>
        Registrar
      </button>
      <HistorySection controller={controller} />
    </div>
  )
}

beforeEach(() => localStorage.clear())

describe('HistorySection', () => {
  it('shows Spanish empty states without runs or favorites', () => {
    render(<Harness />)
    expect(screen.getByText(/Todavía no tenés favoritas/)).toBeInTheDocument()
    expect(screen.getByText(/Acá vas a ver tus recetas/)).toBeInTheDocument()
  })

  it('keeps history and favorites across a reload', () => {
    historyStore.save([ENTRY])
    favoritesStore.save(['s1'])
    const { unmount } = render(<Harness />)
    expect(screen.getAllByText('Tortilla simple')).toHaveLength(2)
    expect(screen.getByLabelText('Tus favoritas')).toBeInTheDocument()
    unmount()
    render(<Harness />)
    expect(screen.getAllByText('Tortilla simple')).toHaveLength(2)
    expect(historyStore.load()).toHaveLength(1)
    expect(favoritesStore.load()).toEqual(['s1'])
  })

  it('unfavoriting leaves favorites but keeps the recipe in history', () => {
    historyStore.save([ENTRY])
    favoritesStore.save(['s1'])
    render(<Harness />)
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Quitar Tortilla simple de favoritas' })[0]!,
    )
    expect(screen.getByText(/Todavía no tenés favoritas/)).toBeInTheDocument()
    expect(screen.getAllByText('Tortilla simple')).toHaveLength(1)
    expect(favoritesStore.load()).toEqual([])
    expect(historyStore.load()).toHaveLength(1)
  })

  it('records a run once even when reported twice', () => {
    render(<RecordHarness />)
    fireEvent.click(screen.getByRole('button', { name: 'Registrar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Registrar' }))
    expect(screen.getByText('Huevo revuelto')).toBeInTheDocument()
    expect(historyStore.load()).toHaveLength(1)
  })
})

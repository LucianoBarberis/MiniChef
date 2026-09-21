import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { useGeneration } from '../features/recipes/useGeneration.ts'
import { API_ERROR_MESSAGES } from '../lib/openrouter/errors.ts'
import { DEFAULT_FILTERS } from '../lib/prompt/builders.ts'

const INPUT = {
  apiKey: 'sk-or-test',
  ingredients: [{ id: 'i1', name: 'huevo', amount: 2, unit: 'u' as const }],
  filters: DEFAULT_FILTERS,
}

const VALID_PAYLOAD = JSON.stringify({
  strict: [
    {
      id: 's1',
      title: 'Tortilla simple',
      timeMin: 20,
      servings: 2,
      owned: ['huevo'],
      missing: [],
      steps: ['Batir.', 'Servir.'],
      strict: true,
    },
  ],
  flexible: [],
})

function successResponse(content: string) {
  return { ok: true, json: () => Promise.resolve({ choices: [{ message: { content } }] }) }
}

function Harness() {
  const { payload, error, generate } = useGeneration()
  return (
    <div>
      <button type="button" onClick={() => void generate(INPUT)}>
        Generar
      </button>
      {error !== null && <p role="alert">{API_ERROR_MESSAGES[error]}</p>}
      {payload?.strict.map((recipe) => <h4 key={recipe.id}>{recipe.title}</h4>)}
    </div>
  )
}

function clickGenerate() {
  fireEvent.click(screen.getByRole('button', { name: 'Generar' }))
}

describe('useGeneration with mocked fetch', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('maps a 401 to the invalid-key Spanish message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }))
    render(<Harness />)
    clickGenerate()
    expect(await screen.findByRole('alert')).toHaveTextContent(/Clave inválida/)
  })

  it('maps a 402 to the no-credit Spanish message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 402 }))
    render(<Harness />)
    clickGenerate()
    expect(await screen.findByRole('alert')).toHaveTextContent(/Sin crédito/)
  })

  it('maps a 429 to the rate-limit Spanish message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429 }))
    render(<Harness />)
    clickGenerate()
    expect(await screen.findByRole('alert')).toHaveTextContent(/Límite de solicitudes/)
  })

  it('retries once with the repair prompt after bad JSON then renders', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(successResponse('{no valido'))
      .mockResolvedValueOnce(successResponse(VALID_PAYLOAD))
    vi.stubGlobal('fetch', fetchMock)
    render(<Harness />)
    clickGenerate()
    expect(await screen.findByText('Tortilla simple')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    const retryBody = JSON.parse(
      (fetchMock.mock.calls[1]?.[1] as RequestInit).body as string,
    ) as { messages: unknown[] }
    expect(retryBody.messages).toHaveLength(4)
  })

  it('fails with bad-output when the repair retry is still invalid', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(successResponse('{todavía roto')))
    render(<Harness />)
    clickGenerate()
    expect(await screen.findByRole('alert')).toHaveTextContent(/no fue válida/)
  })

  it('renders strict results on a first-try success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(successResponse(VALID_PAYLOAD)))
    render(<Harness />)
    clickGenerate()
    expect(await screen.findByText('Tortilla simple')).toBeInTheDocument()
  })
})

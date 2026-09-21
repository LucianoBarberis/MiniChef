import { useState } from 'react'
import { apiKeyStore } from '../../lib/storage/apiKey.ts'

/** localStorage-only vault. The key is never hardcoded or logged. */
export function useKeyVault() {
  const [apiKey, setApiKey] = useState<string | null>(() => apiKeyStore.load())

  const save = (key: string): boolean => {
    const value = key.trim()
    if (value.length === 0) return false
    apiKeyStore.save(value)
    setApiKey(value)
    return true
  }

  const remove = (): void => {
    apiKeyStore.clear()
    setApiKey(null)
  }

  return { apiKey, hasKey: apiKey !== null, save, remove }
}

function maskKey(key: string): string {
  return key.length <= 8 ? '••••' : `${key.slice(0, 4)}••••${key.slice(-4)}`
}

export function KeyVault() {
  const { apiKey, hasKey, save, remove } = useKeyVault()
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = (event: React.FormEvent): void => {
    event.preventDefault()
    if (save(draft)) {
      setDraft('')
      setError(null)
    } else {
      setError('Pegá tu clave de OpenRouter para guardarla.')
    }
  }

  return (
    <section aria-labelledby="clave-titulo">
      <h2 id="clave-titulo">Clave de OpenRouter</h2>
      {hasKey ? (
        <div>
          <p>Clave guardada: <code>{maskKey(apiKey ?? '')}</code></p>
          <button type="button" onClick={remove}>
            Eliminar clave
          </button>
        </div>
      ) : (
        <div>
          <form onSubmit={submit}>
            <label>
              Tu clave
              <input
                type="password"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="sk-or-…"
                autoComplete="off"
              />
            </label>
            <button type="submit">Guardar clave</button>
            {error !== null && <p role="alert">{error}</p>}
          </form>
          <p>Sin clave no se pueden generar recetas. Guardá tu clave para empezar.</p>
        </div>
      )}
    </section>
  )
}

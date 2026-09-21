import { useState } from 'react'
import { KeyRound } from 'lucide-react'
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

/** Shared controller type so App can lift state for the generation section. */
export type KeyVaultController = ReturnType<typeof useKeyVault>

export function KeyVault({ controller }: { controller: KeyVaultController }) {
  const { apiKey, hasKey, save, remove } = controller
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
      <h2 id="clave-titulo" className="section-heading">
        <KeyRound size={20} aria-hidden="true" /> Clave de OpenRouter
      </h2>
      {hasKey ? (
        <div className="card">
          <p className="card-meta">Clave guardada: <code>{maskKey(apiKey ?? '')}</code></p>
          <button type="button" className="btn-ghost" onClick={remove}>
            Eliminar clave
          </button>
        </div>
      ) : (
        <div className="card">
          <form onSubmit={submit}>
            <label className="field">
              Tu clave
              <input
                type="password"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="sk-or-…"
                autoComplete="off"
              />
            </label>
            <button type="submit" className="btn-primary">Guardar clave</button>
            {error !== null && <p role="alert" className="alert">{error}</p>}
          </form>
          <p className="card-meta">Sin clave no se pueden generar recetas. Guardá tu clave para empezar.</p>
        </div>
      )}
    </section>
  )
}

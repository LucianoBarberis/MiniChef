import { useRef, useState } from 'react'
import { UNITS, UNIT_LABELS, type Unit } from '../../lib/storage/ingredients.ts'
import { INGREDIENT_ERROR_MESSAGES, useIngredients, type IngredientDraft } from './useIngredients.ts'
import { suggestIngredients } from './staples.ts'

/** Lucide `x` icon (inline SVG: no extra dependency for a single glyph). */
function XIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

/** Shared controller type so App can lift state for the generation section. */
export type IngredientsController = ReturnType<typeof useIngredients>

/** Quantity form + autocomplete + chips. One unified list, quantities required. */
export function IngredientsSection({ controller }: { controller: IngredientsController }) {
  const { ingredients, error, add, remove } = controller
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [unit, setUnit] = useState<Unit | ''>('')
  const [touched, setTouched] = useState(false)
  const amountRef = useRef<HTMLInputElement>(null)

  const suggestions = suggestIngredients(
    name,
    ingredients.map((item) => item.name),
  )

  const acceptSuggestion = (picked: string): void => {
    setName(picked)
    setTouched(false)
    amountRef.current?.focus()
  }

  const submit = (event: React.FormEvent): void => {
    event.preventDefault()
    const draft: IngredientDraft = { name, amount: Number(amount), unit }
    if (add(draft)) {
      setName('')
      setAmount('')
      setUnit('')
      setTouched(false)
    }
  }

  return (
    <section aria-labelledby="ingredientes-titulo">
      <h2 id="ingredientes-titulo">Ingredientes</h2>
      <form onSubmit={submit}>
        <label>
          Ingrediente
          <input
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setTouched(true)
            }}
            placeholder="Ej.: tomate"
            autoComplete="off"
          />
        </label>
        {touched && suggestions.length > 0 && (
          <ul role="listbox" aria-label="Sugerencias">
            {suggestions.map((item) => (
              <li key={item}>
                <button type="button" onClick={() => acceptSuggestion(item)}>
                  {item}
                </button>
              </li>
            ))}
          </ul>
        )}
        <label>
          Cantidad
          <input
            ref={amountRef}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Ej.: 3"
            inputMode="decimal"
          />
        </label>
        <label>
          Unidad
          <select value={unit} onChange={(event) => setUnit(event.target.value as Unit | '')}>
            <option value="">Elegí…</option>
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {UNIT_LABELS[u]} ({u})
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Agregar</button>
        {error !== null && <p role="alert">{INGREDIENT_ERROR_MESSAGES[error]}</p>}
      </form>
      {ingredients.length === 0 ? (
        <p>Todavía no agregaste ingredientes.</p>
      ) : (
        <ul aria-label="Tus ingredientes">
          {ingredients.map((item) => (
            <li key={item.id}>
              {item.name} {item.amount} {UNIT_LABELS[item.unit]}{' '}
              <button type="button" aria-label={`Quitar ${item.name}`} onClick={() => remove(item.id)}>
                <XIcon />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

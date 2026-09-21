import { useRef, useState } from 'react'
import type { Unit } from '../../lib/storage/ingredients.ts'
import { INGREDIENT_ERROR_MESSAGES, useIngredients, type IngredientDraft } from './useIngredients.ts'
import { suggestIngredients } from './staples.ts'

const UNITS: Unit[] = ['u', 'g', 'kg', 'ml', 'l', 'cda', 'cdta', 'taza']

/** Quantity form + autocomplete + chips. One unified list, quantities required. */
export function IngredientsSection() {
  const { ingredients, error, add, remove } = useIngredients()
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
                {u}
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
              {item.name} {item.amount} {item.unit}{' '}
              <button type="button" aria-label={`Quitar ${item.name}`} onClick={() => remove(item.id)}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

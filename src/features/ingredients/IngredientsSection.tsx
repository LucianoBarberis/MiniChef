import { useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { UNITS, UNIT_LABELS, type Unit } from '../../lib/storage/ingredients.ts'
import { INGREDIENT_ERROR_MESSAGES, useIngredients, type IngredientDraft } from './useIngredients.ts'
import { suggestIngredients } from './staples.ts'

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
      <h2 id="ingredientes-titulo" className="section-heading">
        <Search size={20} aria-hidden="true" /> Ingredientes
      </h2>
      <form onSubmit={submit}>
        <label className="field">
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
          <ul role="listbox" aria-label="Sugerencias" className="suggestions">
            {suggestions.map((item) => (
              <li key={item}>
                <button type="button" onClick={() => acceptSuggestion(item)}>
                  {item}
                </button>
              </li>
            ))}
          </ul>
        )}
        <label className="field">
          Cantidad
          <input
            ref={amountRef}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Ej.: 3"
            inputMode="decimal"
          />
        </label>
        <label className="field">
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
        <button type="submit" className="btn-primary">Agregar</button>
        {error !== null && <p role="alert" className="alert">{INGREDIENT_ERROR_MESSAGES[error]}</p>}
      </form>
      {ingredients.length === 0 ? (
        <div className="empty-state">
          <Search size={24} aria-hidden="true" />
          <p>Todavía no agregaste ingredientes.</p>
        </div>
      ) : (
        <ul aria-label="Tus ingredientes" className="chip-list">
          {ingredients.map((item) => (
            <li key={item.id} className="chip">
              {item.name} {item.amount} {UNIT_LABELS[item.unit]}{' '}
              <button
                type="button"
                className="chip-remove"
                aria-label={`Quitar ${item.name}`}
                onClick={() => remove(item.id)}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

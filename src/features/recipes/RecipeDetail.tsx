import { useEffect } from 'react'
import type { Recipe } from '../../lib/openrouter/recipeSchema.ts'

interface RecipeDetailProps {
  recipe: Recipe | null
  onClose: () => void
}

/** Single recipe view: time, servings, owned/missing, ordered steps. */
export function RecipeDetail({ recipe, onClose }: RecipeDetailProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (recipe === null) return null

  return (
    <div
      role="presentation"
      className="dialog-overlay"
      onClick={onClose}
    >
      <div role="dialog" aria-modal="true" aria-label={recipe.title} className="dialog" onClick={(event) => event.stopPropagation()}>
        <h3 className="card-title">{recipe.title}</h3>
        <p className="card-meta">
          {recipe.timeMin} min · {recipe.servings} porciones
        </p>
        <h4>Ingredientes</h4>
        <ul className="list">
          {recipe.owned.map((item) => (
            <li key={item}>{item}</li>
          ))}
          {recipe.missing.map((item) => (
            <li key={item}>Falta: {item}</li>
          ))}
        </ul>
        <h4>Pasos</h4>
        <ol className="list">
          {recipe.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
        <button type="button" className="btn-ghost" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  )
}

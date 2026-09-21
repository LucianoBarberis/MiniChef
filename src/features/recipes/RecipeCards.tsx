import type { GenerationPayload, Recipe } from '../../lib/openrouter/recipeSchema.ts'
import type { GenerationStatus } from './useGeneration.ts'

interface RecipeCardsProps {
  status: GenerationStatus
  payload: GenerationPayload | null
  onSelect: (recipe: Recipe) => void
}

function RecipeCard({ recipe, index, onSelect }: { recipe: Recipe; index: number; onSelect: (recipe: Recipe) => void }) {
  return (
    <li>
      <article className="card">
        <span className="card-numeral" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h4 className="card-title">{recipe.title}</h4>
        <p className="card-meta">
          {recipe.timeMin} min · {recipe.servings} porciones
        </p>
        {!recipe.strict && (
          <p className="card-missing">
            Te faltan: {recipe.missing.join(', ')}
          </p>
        )}
        <button type="button" className="btn-ghost" onClick={() => onSelect(recipe)}>
          Ver detalle
        </button>
      </article>
    </li>
  )
}

function SkeletonList() {
  return (
    <ul className="recipe-skeletons" aria-label="Generando recetas" aria-busy="true">
      {[0, 1, 2].map((key) => (
        <li key={key} aria-hidden="true">
          <article className="skeleton-card" aria-hidden="true">
            <span className="skeleton skeleton-title" />
            <span className="skeleton skeleton-meta" />
            <span className="skeleton skeleton-action" />
            <span className="shimmer" />
          </article>
        </li>
      ))}
    </ul>
  )
}

/** Hybrid results: strict (≤5) + flexible (≤3) with missing flags. */
export function RecipeCards({ status, payload, onSelect }: RecipeCardsProps) {
  if (status === 'loading') return <SkeletonList />
  if (status === 'idle' || payload === null) {
    return (
      <div className="empty-state">
        <p>Agregá ingredientes y generá recetas para verlas acá.</p>
      </div>
    )
  }
  if (payload.strict.length === 0 && payload.flexible.length === 0) {
    return (
      <div className="empty-state">
        <p>No salieron recetas. Probá con otros ingredientes o filtros.</p>
      </div>
    )
  }
  return (
    <div>
      <section aria-labelledby="estrictas-titulo">
        <h3 id="estrictas-titulo">Con lo que tenés ({payload.strict.length})</h3>
        {payload.strict.length === 0 ? (
          <div className="empty-state">
            <p>Ninguna receta usa solo lo que tenés.</p>
          </div>
        ) : (
          <ul className="card-grid">
            {payload.strict.map((recipe, index) => (
              <RecipeCard key={recipe.id} recipe={recipe} index={index} onSelect={onSelect} />
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="flexibles-titulo">
        <h3 id="flexibles-titulo">Con 1 o 2 faltantes ({payload.flexible.length})</h3>
        {payload.flexible.length === 0 ? (
          <div className="empty-state">
            <p>Ninguna receta flexible esta vez.</p>
          </div>
        ) : (
          <ul className="card-grid">
            {payload.flexible.map((recipe, index) => (
              <RecipeCard key={recipe.id} recipe={recipe} index={index} onSelect={onSelect} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

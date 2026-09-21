import type { GenerationPayload, Recipe } from '../../lib/openrouter/recipeSchema.ts'
import type { GenerationStatus } from './useGeneration.ts'

interface RecipeCardsProps {
  status: GenerationStatus
  payload: GenerationPayload | null
  onSelect: (recipe: Recipe) => void
}

function RecipeCard({ recipe, onSelect }: { recipe: Recipe; onSelect: (recipe: Recipe) => void }) {
  return (
    <li>
      <article>
        <h4>{recipe.title}</h4>
        <p>
          {recipe.timeMin} min · {recipe.servings} porciones
        </p>
        {!recipe.strict && (
          <p>
            Te faltan: {recipe.missing.join(', ')}
          </p>
        )}
        <button type="button" onClick={() => onSelect(recipe)}>
          Ver detalle
        </button>
      </article>
    </li>
  )
}

function SkeletonList() {
  return (
    <ul aria-label="Generando recetas" aria-busy="true">
      {[0, 1, 2].map((key) => (
        <li key={key} aria-hidden="true">
          Generando…
        </li>
      ))}
    </ul>
  )
}

/** Hybrid results: strict (≤5) + flexible (≤3) with missing flags. */
export function RecipeCards({ status, payload, onSelect }: RecipeCardsProps) {
  if (status === 'loading') return <SkeletonList />
  if (status === 'idle' || payload === null) {
    return <p>Agregá ingredientes y generá recetas para verlas acá.</p>
  }
  if (payload.strict.length === 0 && payload.flexible.length === 0) {
    return <p>No salieron recetas. Probá con otros ingredientes o filtros.</p>
  }
  return (
    <div>
      <section aria-labelledby="estrictas-titulo">
        <h3 id="estrictas-titulo">Con lo que tenés ({payload.strict.length})</h3>
        {payload.strict.length === 0 ? (
          <p>Ninguna receta usa solo lo que tenés.</p>
        ) : (
          <ul>
            {payload.strict.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} onSelect={onSelect} />
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="flexibles-titulo">
        <h3 id="flexibles-titulo">Con 1 o 2 faltantes ({payload.flexible.length})</h3>
        {payload.flexible.length === 0 ? (
          <p>Ninguna receta flexible esta vez.</p>
        ) : (
          <ul>
            {payload.flexible.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} onSelect={onSelect} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

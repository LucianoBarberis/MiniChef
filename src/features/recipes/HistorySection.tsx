import { Heart, History } from 'lucide-react'
import type { StoredRecipe } from '../../lib/storage/history.ts'
import type { HistoryController } from './useHistory.ts'

function FavoriteButton({
  recipe,
  isFavorite,
  onToggle,
}: {
  recipe: StoredRecipe
  isFavorite: boolean
  onToggle: (id: string) => void
}) {
  return (
    <button
      type="button"
      className="btn-ghost"
      aria-pressed={isFavorite}
      aria-label={isFavorite ? `Quitar ${recipe.title} de favoritas` : `Guardar ${recipe.title} en favoritas`}
      onClick={() => onToggle(recipe.id)}
    >
      {isFavorite ? 'Quitar de favoritas' : 'Guardar en favoritas'}
    </button>
  )
}

/** Favorites + past runs. Favorites survive reload; unfavorite keeps history. */
export function HistorySection({ controller }: { controller: HistoryController }) {
  const { entries, favorites, toggleFavorite } = controller
  const byId = new Map(entries.flatMap((entry) => entry.recipes).map((recipe) => [recipe.id, recipe]))
  const favoriteRecipes = favorites.flatMap((id) => {
    const recipe = byId.get(id)
    return recipe === undefined ? [] : [recipe]
  })

  return (
    <section aria-labelledby="historial-titulo">
      <h2 id="historial-titulo" className="section-heading">
        <History size={20} aria-hidden="true" /> Historial y favoritas
      </h2>
      <section aria-labelledby="favoritas-titulo">
        <h3 id="favoritas-titulo" className="section-heading">
          <Heart size={18} aria-hidden="true" /> Favoritas ({favoriteRecipes.length})
        </h3>
        {favoriteRecipes.length === 0 ? (
          <div className="empty-state">
            <Heart size={24} aria-hidden="true" />
            <p>Todavía no tenés favoritas. Guardá una receta para verla acá.</p>
          </div>
        ) : (
          <ul aria-label="Tus favoritas" className="list">
            {favoriteRecipes.map((recipe) => (
              <li key={recipe.id}>
                {recipe.title}{' '}
                <FavoriteButton recipe={recipe} isFavorite onToggle={toggleFavorite} />
              </li>
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="generaciones-titulo">
        <h3 id="generaciones-titulo">Últimas generaciones ({entries.length})</h3>
        {entries.length === 0 ? (
          <div className="empty-state">
            <History size={24} aria-hidden="true" />
            <p>Acá vas a ver tus recetas generadas.</p>
          </div>
        ) : (
          entries.map((entry) => (
            <article key={entry.id} className="card">
              <h4 className="card-title">
                {new Date(entry.createdAt).toLocaleString('es')} ({entry.recipes.length}{' '}
                {entry.recipes.length === 1 ? 'receta' : 'recetas'})
              </h4>
              <ul className="list">
                {entry.recipes.map((recipe) => (
                  <li key={recipe.id}>
                    {recipe.title}
                    {!recipe.strict && (
                      <>
                        {' '}<span className="badge">flexible</span>
                      </>
                    )}{' '}
                    <FavoriteButton
                      recipe={recipe}
                      isFavorite={favorites.includes(recipe.id)}
                      onToggle={toggleFavorite}
                    />
                  </li>
                ))}
              </ul>
            </article>
          ))
        )}
      </section>
    </section>
  )
}

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
      <h2 id="historial-titulo">Historial y favoritas</h2>
      <section aria-labelledby="favoritas-titulo">
        <h3 id="favoritas-titulo">Favoritas ({favoriteRecipes.length})</h3>
        {favoriteRecipes.length === 0 ? (
          <p>Todavía no tenés favoritas. Guardá una receta para verla acá.</p>
        ) : (
          <ul aria-label="Tus favoritas">
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
          <p>Acá vas a ver tus recetas generadas.</p>
        ) : (
          entries.map((entry) => (
            <article key={entry.id}>
              <h4>
                {new Date(entry.createdAt).toLocaleString('es')} ({entry.recipes.length}{' '}
                {entry.recipes.length === 1 ? 'receta' : 'recetas'})
              </h4>
              <ul>
                {entry.recipes.map((recipe) => (
                  <li key={recipe.id}>
                    {recipe.title}
                    {!recipe.strict && ' · flexible'}{' '}
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

import { IngredientsSection } from './features/ingredients/IngredientsSection.tsx'
import { useIngredients } from './features/ingredients/useIngredients.ts'
import { GenerationSection } from './features/recipes/GenerationSection.tsx'
import { KeyVault, useKeyVault } from './features/settings/KeyVault.tsx'

export default function App() {
  const ingredientsController = useIngredients()
  const vaultController = useKeyVault()

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>MiniChef</h1>
        <p>Recetas con los ingredientes que ya tienes.</p>
      </header>
      <main>
        <IngredientsSection controller={ingredientsController} />
        <KeyVault controller={vaultController} />
        <GenerationSection
          ingredients={ingredientsController.ingredients}
          apiKey={vaultController.apiKey}
        />
      </main>
    </div>
  )
}

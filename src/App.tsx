import { IngredientsSection } from './features/ingredients/IngredientsSection.tsx'
import { useIngredients } from './features/ingredients/useIngredients.ts'
import { GenerationSection } from './features/recipes/GenerationSection.tsx'
import { HistorySection } from './features/recipes/HistorySection.tsx'
import { useHistory } from './features/recipes/useHistory.ts'
import { KeyVault, useKeyVault } from './features/settings/KeyVault.tsx'

export default function App() {
  const ingredientsController = useIngredients()
  const vaultController = useKeyVault()
  const historyController = useHistory()

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-header-title">MiniChef</h1>
        <p className="app-header-subtitle">Recetas con los ingredientes que ya tienes.</p>
      </header>
      <main>
        <IngredientsSection controller={ingredientsController} />
        <KeyVault controller={vaultController} />
        <GenerationSection
          ingredients={ingredientsController.ingredients}
          apiKey={vaultController.apiKey}
          onSuccess={historyController.recordRun}
        />
        <HistorySection controller={historyController} />
      </main>
    </div>
  )
}

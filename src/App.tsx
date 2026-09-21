import { ChefHat } from 'lucide-react'
import { ThemeToggle } from './components/ThemeToggle.tsx'
import { IngredientsSection } from './features/ingredients/IngredientsSection.tsx'
import { useIngredients } from './features/ingredients/useIngredients.ts'
import { GenerationSection } from './features/recipes/GenerationSection.tsx'
import { HistorySection } from './features/recipes/HistorySection.tsx'
import { useHistory } from './features/recipes/useHistory.ts'
import { KeyVault, useKeyVault } from './features/settings/KeyVault.tsx'
import { useTheme } from './features/settings/useTheme.ts'

export default function App() {
  const ingredientsController = useIngredients()
  const vaultController = useKeyVault()
  const historyController = useHistory()
  const { theme, toggle } = useTheme()

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-text">
          <h1 className="app-header-title section-heading">
            <ChefHat size={32} aria-hidden="true" /> MiniChef
          </h1>
          <p className="app-header-subtitle">Recetas con los ingredientes que ya tienes.</p>
        </div>
        <ThemeToggle theme={theme} onToggle={toggle} />
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

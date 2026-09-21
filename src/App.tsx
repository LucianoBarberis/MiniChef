import { IngredientsSection } from './features/ingredients/IngredientsSection.tsx'
import { KeyVault } from './features/settings/KeyVault.tsx'

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>MiniChef</h1>
        <p>Recetas con los ingredientes que ya tienes.</p>
      </header>
      <main>
        <IngredientsSection />
        <KeyVault />
      </main>
    </div>
  )
}

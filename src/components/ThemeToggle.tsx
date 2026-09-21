import { Moon, Sun } from 'lucide-react'
import type { Theme } from '../features/settings/useTheme.ts'

interface ThemeToggleProps {
  theme: Theme
  onToggle: () => void
}

/** Header theme toggle. Visual-only: Sun/Moon swap, Spanish accessible name. */
export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-pressed={dark}
      onClick={onToggle}
    >
      {dark ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
    </button>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { readRaw, writeRaw } from '../../lib/storage/keys.ts'

export type Theme = 'light' | 'dark'

const THEME_META: Record<Theme, string> = {
  light: '#FFF9F2',
  dark: '#1C1410',
}

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark'
}

function resolveInitialTheme(): Theme {
  const stored = readRaw('theme')
  if (isTheme(stored)) return stored
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  }
  return 'light'
}

function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta !== null) meta.setAttribute('content', THEME_META[theme])
}

/**
 * Kitchen theme state. First visit follows the OS scheme without writing
 * storage; the stored value is written only when the user toggles.
 * Invalid stored values are ignored (OS fallback applies).
 */
export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(() => resolveInitialTheme())

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'light' ? 'dark' : 'light'
      writeRaw('theme', next)
      return next
    })
  }, [])

  return { theme, toggle }
}
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { X } from 'lucide-react'
import App from '../App.tsx'
import { ThemeToggle } from '../components/ThemeToggle.tsx'
import { useTheme } from '../features/settings/useTheme.ts'
import { storageKey } from '../lib/storage/keys.ts'

const THEME_KEY = storageKey('theme')

function stubMatchMedia(dark: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: dark && query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  )
}

function Harness() {
  const { theme, toggle } = useTheme()
  return <ThemeToggle theme={theme} onToggle={toggle} />
}

beforeEach(() => {
  localStorage.clear()
  vi.unstubAllGlobals()
  delete document.documentElement.dataset.theme
  document.documentElement.style.colorScheme = ''
  document.querySelector('meta[name="theme-color"]')?.remove()
})

describe('useTheme', () => {
  it('falls back to the OS scheme without writing storage on first visit', () => {
    stubMatchMedia(true)
    render(<Harness />)
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem(THEME_KEY)).toBeNull()
  })

  it('defaults to light when the OS prefers light', () => {
    stubMatchMedia(false)
    render(<Harness />)
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('ignores an invalid stored value and uses the OS fallback', () => {
    stubMatchMedia(false)
    localStorage.setItem(THEME_KEY, 'sepia')
    render(<Harness />)
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('persists the toggle and syncs meta plus colorScheme', () => {
    stubMatchMedia(false)
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    document.head.append(meta)
    render(<Harness />)
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar a modo oscuro' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem(THEME_KEY)).toBe('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(meta.getAttribute('content')).toBe('#1C1410')
  })
})

describe('ThemeToggle and icons', () => {
  it('flips data-theme from the header without touching copy', () => {
    stubMatchMedia(false)
    render(<App />)
    expect(screen.getByText('Recetas con los ingredientes que ya tienes.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar a modo oscuro' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(screen.getByRole('button', { name: 'Cambiar a modo claro' })).toBeInTheDocument()
  })

  it('renders Sun, Moon and X glyphs with accessible names and no emoji', () => {
    stubMatchMedia(false)
    const { rerender } = render(<ThemeToggle theme="light" onToggle={() => {}} />)
    expect(screen.getByRole('button', { name: 'Cambiar a modo oscuro' }).querySelector('svg')).not.toBeNull()
    rerender(<ThemeToggle theme="dark" onToggle={() => {}} />)
    expect(screen.getByRole('button', { name: 'Cambiar a modo claro' }).querySelector('svg')).not.toBeNull()
    const { container } = render(<X size={16} aria-hidden="true" />)
    expect(container.querySelector('svg')).not.toBeNull()
    for (const button of screen.getAllByRole('button')) {
      expect(button.textContent).not.toMatch(/\p{Extended_Pictographic}/u)
    }
  })
})

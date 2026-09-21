import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { KeyVault } from '../features/settings/KeyVault.tsx'
import { apiKeyStore } from '../lib/storage/apiKey.ts'

beforeEach(() => localStorage.clear())

describe('KeyVault', () => {
  it('saves the key and shows it masked', () => {
    render(<KeyVault />)
    fireEvent.change(screen.getByPlaceholderText('sk-or-…'), { target: { value: 'sk-or-12345678' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar clave' }))
    expect(apiKeyStore.load()).toBe('sk-or-12345678')
    expect(screen.getByText(/Clave guardada/)).toBeInTheDocument()
    expect(screen.queryByText(/sk-or-12345678/)).not.toBeInTheDocument()
  })

  it('rejects an empty key with a Spanish error', () => {
    render(<KeyVault />)
    fireEvent.click(screen.getByRole('button', { name: 'Guardar clave' }))
    expect(screen.getByRole('alert')).toHaveTextContent(/Pegá tu clave/)
    expect(apiKeyStore.load()).toBeNull()
  })

  it('deletes the key and blocks generation with a Spanish prompt', () => {
    apiKeyStore.save('sk-or-abc')
    render(<KeyVault />)
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar clave' }))
    expect(apiKeyStore.load()).toBeNull()
    expect(screen.getByText(/Sin clave no se pueden generar recetas/)).toBeInTheDocument()
  })
})

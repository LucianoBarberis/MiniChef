import { beforeEach, describe, expect, it } from 'vitest'
import { apiKeyStore } from '../lib/storage/apiKey.ts'
import { favoritesStore, toggleFavorite } from '../lib/storage/favorites.ts'
import { historyStore } from '../lib/storage/history.ts'
import { ingredientsStore } from '../lib/storage/ingredients.ts'
import { storageKey } from '../lib/storage/keys.ts'

beforeEach(() => {
  localStorage.clear()
})

describe('versioned storage adapters', () => {
  it('uses the minichef:v1: key contract', () => {
    expect(storageKey('ingredients')).toBe('minichef:v1:ingredients')
    expect(storageKey('key')).toBe('minichef:v1:key')
    expect(storageKey('history')).toBe('minichef:v1:history')
    expect(storageKey('favorites')).toBe('minichef:v1:favorites')
  })

  it('round-trips ingredients through localStorage', () => {
    expect(ingredientsStore.load()).toEqual([])
    ingredientsStore.save([{ id: 'a1', name: 'tomate', amount: 3, unit: 'u' }])
    expect(ingredientsStore.load()).toEqual([{ id: 'a1', name: 'tomate', amount: 3, unit: 'u' }])
  })

  it('round-trips the api key and supports delete', () => {
    expect(apiKeyStore.load()).toBeNull()
    apiKeyStore.save('sk-or-test')
    expect(apiKeyStore.load()).toBe('sk-or-test')
    apiKeyStore.clear()
    expect(apiKeyStore.load()).toBeNull()
  })

  it('wipes a slice to defaults on version mismatch', () => {
    localStorage.setItem(storageKey('ingredients'), JSON.stringify({ version: 'v0', value: ['stale'] }))
    expect(ingredientsStore.load()).toEqual([])
    expect(localStorage.getItem(storageKey('ingredients'))).toBeNull()
  })

  it('wipes a slice to defaults on corrupt payload', () => {
    localStorage.setItem(storageKey('history'), 'not-json{{{')
    expect(historyStore.load()).toEqual([])
  })

  it('toggles favorites without touching history', () => {
    historyStore.save([{ id: 'h1', createdAt: '2026-09-21', recipes: [] }])
    favoritesStore.save(toggleFavorite(favoritesStore.load(), 'r1'))
    expect(favoritesStore.load()).toEqual(['r1'])
    favoritesStore.save(toggleFavorite(favoritesStore.load(), 'r1'))
    expect(favoritesStore.load()).toEqual([])
    expect(historyStore.load()).toHaveLength(1)
  })

  it('returns independent defaults so callers cannot poison the cache', () => {
    const first = ingredientsStore.load()
    first.push({ id: 'hack', name: 'x', amount: 1, unit: 'u' })
    expect(ingredientsStore.load()).toEqual([])
  })
})

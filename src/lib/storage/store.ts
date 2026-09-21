import { readRaw, removeRaw, STORAGE_VERSION, type StorageSlice, writeRaw } from './keys.ts'

export interface VersionedStore<T> {
  load(): T
  save(value: T): void
  clear(): void
}

/**
 * Versioned localStorage adapter. On schema break (unparseable payload or
 * version mismatch) the slice is wiped back to `defaults` — never migrated.
 */
export function createVersionedStore<T>(slice: StorageSlice, defaults: T): VersionedStore<T> {
  const cloneDefaults = (): T =>
    typeof defaults === 'object' && defaults !== null
      ? (JSON.parse(JSON.stringify(defaults)) as T)
      : defaults

  return {
    load(): T {
      const raw = readRaw(slice)
      if (raw === null) return cloneDefaults()
      try {
        const parsed = JSON.parse(raw) as { version?: unknown; value?: unknown }
        if (typeof parsed !== 'object' || parsed === null || parsed.version !== STORAGE_VERSION) {
          removeRaw(slice)
          return cloneDefaults()
        }
        return parsed.value as T
      } catch {
        removeRaw(slice)
        return cloneDefaults()
      }
    },

    save(value: T): void {
      writeRaw(slice, JSON.stringify({ version: STORAGE_VERSION, value }))
    },

    clear(): void {
      removeRaw(slice)
    },
  }
}

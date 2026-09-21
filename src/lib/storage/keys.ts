/** Storage key contract: `minichef:v1:<slice>`. Bump VERSION to wipe a slice. */

export const STORAGE_PREFIX = 'minichef'
export const STORAGE_VERSION = 'v1'

export type StorageSlice = 'ingredients' | 'key' | 'history' | 'favorites'

export function storageKey(slice: StorageSlice): string {
  return `${STORAGE_PREFIX}:${STORAGE_VERSION}:${slice}`
}

function getStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

export function readRaw(slice: StorageSlice): string | null {
  try {
    return getStorage()?.getItem(storageKey(slice)) ?? null
  } catch {
    return null
  }
}

export function writeRaw(slice: StorageSlice, value: string): void {
  try {
    getStorage()?.setItem(storageKey(slice), value)
  } catch {
    // Storage full or unavailable: state stays in memory only.
  }
}

export function removeRaw(slice: StorageSlice): void {
  try {
    getStorage()?.removeItem(storageKey(slice))
  } catch {
    // Nothing to clean up.
  }
}

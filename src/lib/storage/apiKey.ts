import { createVersionedStore } from './store.ts'

/** User-provided OpenRouter key. Stored only here, never hardcoded. */
export const apiKeyStore = createVersionedStore<string | null>('key', null)

/** Built-in staples for autocomplete, merged with past entries at query time. */
export const STAPLES = [
  'aceite',
  'ajo',
  'arroz',
  'avena',
  'azúcar',
  'cebolla',
  'fideos',
  'harina',
  'huevo',
  'leche',
  'lentejas',
  'manteca',
  'papa',
  'pan',
  'pollo',
  'queso',
  'sal',
  'tomate',
  'zanahoria',
  'zapallo',
]

/** Prefix matches from past entries first, then staples. Max 6, no exact echo. */
export function suggestIngredients(query: string, pastEntries: string[]): string[] {
  const q = query.trim().toLowerCase()
  if (q.length === 0) return []
  const seen = new Set<string>()
  const out: string[] = []
  for (const name of [...pastEntries, ...STAPLES]) {
    const lower = name.toLowerCase()
    if (lower.startsWith(q) && lower !== q && !seen.has(lower)) {
      seen.add(lower)
      out.push(name)
      if (out.length === 6) break
    }
  }
  return out
}

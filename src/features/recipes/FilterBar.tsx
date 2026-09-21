import { DEFAULT_FILTERS, type GenerationFilters } from '../../lib/prompt/builders.ts'

interface FilterBarProps {
  filters: GenerationFilters
  onChange: (filters: GenerationFilters) => void
  disabled: boolean
}

function toPositiveInt(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

/** Pre-request filters. Always controlled; invalid input falls back to defaults. */
export function FilterBar({ filters, onChange, disabled }: FilterBarProps) {
  return (
    <fieldset>
      <legend>Filtros</legend>
      <label>
        Tiempo máximo (min)
        <input
          type="number"
          min={5}
          max={180}
          value={filters.maxTimeMin}
          disabled={disabled}
          onChange={(event) =>
            onChange({
              ...filters,
              maxTimeMin: toPositiveInt(event.target.value, DEFAULT_FILTERS.maxTimeMin),
            })
          }
        />
      </label>
      <label>
        Porciones
        <input
          type="number"
          min={1}
          max={12}
          value={filters.servings}
          disabled={disabled}
          onChange={(event) =>
            onChange({ ...filters, servings: toPositiveInt(event.target.value, DEFAULT_FILTERS.servings) })
          }
        />
      </label>
    </fieldset>
  )
}

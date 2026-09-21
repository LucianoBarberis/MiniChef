export type ApiError = 'invalid-key' | 'no-credit' | 'rate-limit' | 'offline' | 'bad-output' | 'unknown'

/** Distinct Spanish message per failure. UI renders these — never raw statuses. */
export const API_ERROR_MESSAGES: Record<ApiError, string> = {
  'invalid-key': 'Clave inválida. Revisá tu clave de OpenRouter o guardá una nueva.',
  'no-credit': 'Sin crédito en OpenRouter. Recargá saldo para seguir generando.',
  'rate-limit': 'Límite de solicitudes alcanzado. Esperá unos segundos e intentá de nuevo.',
  offline: 'Sin conexión. Revisá tu internet e intentá de nuevo.',
  'bad-output': 'La respuesta no fue válida. Intentá generar de nuevo.',
  unknown: 'Ocurrió un error inesperado. Intentá de nuevo.',
}

/** HTTP status → error kind: 401 invalid-key, 402 no-credit, 429 rate-limit. */
export function mapHttpStatusToError(status: number): ApiError {
  if (status === 401) return 'invalid-key'
  if (status === 402) return 'no-credit'
  if (status === 429) return 'rate-limit'
  return 'unknown'
}

export class OpenRouterError extends Error {
  readonly kind: ApiError
  readonly status?: number

  constructor(kind: ApiError, status?: number) {
    super(API_ERROR_MESSAGES[kind])
    this.name = 'OpenRouterError'
    this.kind = kind
    this.status = status
  }
}

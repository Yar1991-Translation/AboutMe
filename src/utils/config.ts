export const ensureNumber = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

export const ensureString = (value: unknown, fallback = '') => (typeof value === 'string' ? value : fallback)

export const ensureBoolean = (value: unknown, fallback = false) => (typeof value === 'boolean' ? value : fallback)

export const ensureArray = <T>(value: unknown, fallback: T[] = []) => (Array.isArray(value) ? (value as T[]) : fallback)

export const ensureRecord = (value: unknown, fallback: Record<string, unknown> = {}) =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : fallback

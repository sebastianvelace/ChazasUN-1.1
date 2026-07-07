/**
 * Utilidades puras de paginación, independientes de Supabase.
 * Se separan de la capa de datos para poder testearlas sin base de datos.
 */

export const DEFAULT_PAGE_SIZE = 24
export const MAX_PAGE_SIZE = 100

export type PageParams = {
  /** Página 1-based. Valores inválidos se normalizan a 1. */
  page?: number
  /** Tamaño de página. Se acota a [1, MAX_PAGE_SIZE]. */
  pageSize?: number
}

export type PageResult<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

/**
 * Normaliza `page`/`pageSize` a valores seguros y calcula el rango inclusivo
 * `[from, to]` (0-based) que espera `.range()` de Supabase.
 *
 * - `pageSize` se acota a [1, MAX_PAGE_SIZE] (evita que un cliente pida 1M filas).
 * - `page` se acota a >= 1. Decimales se truncan.
 */
export function getPageRange(params: PageParams = {}): {
  page: number
  pageSize: number
  from: number
  to: number
} {
  const rawSize = Math.trunc(params.pageSize ?? DEFAULT_PAGE_SIZE)
  const pageSize = Math.min(Math.max(Number.isFinite(rawSize) ? rawSize : DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE)

  const rawPage = Math.trunc(params.page ?? 1)
  const page = Math.max(Number.isFinite(rawPage) ? rawPage : 1, 1)

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  return { page, pageSize, from, to }
}

/** Envuelve una página de resultados con metadatos de navegación. */
export function buildPageResult<T>(items: T[], total: number, page: number, pageSize: number): PageResult<T> {
  const safeTotal = Math.max(total, 0)
  return {
    items,
    total: safeTotal,
    page,
    pageSize,
    hasMore: page * pageSize < safeTotal,
  }
}

/** Pagina un arreglo ya cargado en memoria (usado por el catálogo demo/mock). */
export function paginateArray<T>(all: readonly T[], params: PageParams = {}): PageResult<T> {
  const { page, pageSize, from, to } = getPageRange(params)
  return buildPageResult(all.slice(from, to + 1), all.length, page, pageSize)
}

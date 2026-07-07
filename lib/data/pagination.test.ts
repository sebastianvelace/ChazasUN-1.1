import { describe, it, expect } from "vitest"
import {
  getPageRange,
  buildPageResult,
  paginateArray,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "@/lib/data/pagination"

describe("getPageRange", () => {
  it("usa los defaults cuando no se pasan params", () => {
    expect(getPageRange()).toEqual({
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      from: 0,
      to: DEFAULT_PAGE_SIZE - 1,
    })
  })

  it("calcula el rango 0-based inclusivo que espera Supabase .range()", () => {
    expect(getPageRange({ page: 3, pageSize: 10 })).toMatchObject({ from: 20, to: 29 })
  })

  it("acota pageSize a MAX_PAGE_SIZE (evita pedir millones de filas)", () => {
    expect(getPageRange({ pageSize: 100000 }).pageSize).toBe(MAX_PAGE_SIZE)
  })

  it("normaliza page < 1 a 1", () => {
    expect(getPageRange({ page: 0 }).page).toBe(1)
    expect(getPageRange({ page: -5 }).page).toBe(1)
  })

  it("trunca decimales y cae al default ante NaN", () => {
    expect(getPageRange({ page: 2.9, pageSize: 5.9 })).toMatchObject({ page: 2, pageSize: 5 })
    expect(getPageRange({ pageSize: NaN }).pageSize).toBe(DEFAULT_PAGE_SIZE)
  })
})

describe("buildPageResult", () => {
  it("hasMore es true cuando quedan más páginas", () => {
    expect(buildPageResult([1, 2], 10, 1, 2).hasMore).toBe(true)
  })

  it("hasMore es false en la última página", () => {
    expect(buildPageResult([9, 10], 10, 5, 2).hasMore).toBe(false)
  })

  it("normaliza un total negativo a 0", () => {
    expect(buildPageResult([], -3, 1, 10).total).toBe(0)
  })
})

describe("paginateArray", () => {
  const data = Array.from({ length: 25 }, (_, i) => i + 1)

  it("devuelve la primera página completa", () => {
    const r = paginateArray(data, { page: 1, pageSize: 10 })
    expect(r.items).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(r).toMatchObject({ total: 25, hasMore: true })
  })

  it("devuelve la última página parcial sin hasMore", () => {
    const r = paginateArray(data, { page: 3, pageSize: 10 })
    expect(r.items).toEqual([21, 22, 23, 24, 25])
    expect(r.hasMore).toBe(false)
  })
})

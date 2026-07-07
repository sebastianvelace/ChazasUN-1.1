import type { SupabaseClient } from "@supabase/supabase-js"
import type { ChazaWithRelations } from "@/types/database"
import { chazaDbToCard, chazaDbRowsToCards } from "@/lib/data/chaza-mapper"
import type { ChazaCard } from "@/types/chaza"
import { getPageRange, buildPageResult, type PageParams, type PageResult } from "@/lib/data/pagination"

const CHAZA_SELECT = `
  id,
  owner_id,
  slug,
  name,
  description,
  location_text,
  schedule,
  cover_image_url,
  map_position,
  geo,
  building_code,
  contact_whatsapp,
  contact_instagram,
  tags,
  rating,
  review_count,
  status,
  created_at,
  updated_at,
  verified_at,
  featured_until,
  featured_rank,
  chaza_categories (
    category_id,
    categories ( id, slug, name, sort_order )
  ),
  chaza_products (
    id,
    chaza_id,
    name,
    price_label,
    sort_order
  )
`

export class ChazaRepositoryError extends Error {
  readonly operation: string

  constructor(operation: string, message: string) {
    super(`No fue posible consultar las chazas (${operation}).`)
    this.name = "ChazaRepositoryError"
    this.operation = operation
    this.cause = new Error(message)
  }
}

function throwRepositoryError(operation: string, message: string): never {
  console.error(`[supabase-chaza-repository] ${operation}`, message)
  throw new ChazaRepositoryError(operation, message)
}

function normalizeRows(data: unknown): ChazaWithRelations[] {
  if (!Array.isArray(data)) return []
  return data as ChazaWithRelations[]
}

export async function listPublishedChazas(supabase: SupabaseClient): Promise<ChazaCard[]> {
  const { data, error } = await supabase
    .from("chazas")
    .select(CHAZA_SELECT)
    .eq("status", "published")
    .order("created_at", { ascending: true })

  if (error) {
    throwRepositoryError("listPublishedChazas", error.message)
  }
  return chazaDbRowsToCards(normalizeRows(data))
}

/**
 * Página de chazas publicadas. Usa `.range()` + `count: "exact"` para traer solo
 * un tramo del catálogo en vez de todas las filas (escala cuando hay muchas chazas).
 * El feed del swiper todavía usa `listPublishedChazas`; migrar a esta función es el
 * siguiente paso (scroll infinito + filtros del lado del servidor).
 */
export async function listPublishedChazasPage(
  supabase: SupabaseClient,
  params: PageParams = {}
): Promise<PageResult<ChazaCard>> {
  const { page, pageSize, from, to } = getPageRange(params)
  const { data, error, count } = await supabase
    .from("chazas")
    .select(CHAZA_SELECT, { count: "exact" })
    .eq("status", "published")
    .order("created_at", { ascending: true })
    .range(from, to)

  if (error) {
    throwRepositoryError("listPublishedChazasPage", error.message)
  }
  return buildPageResult(chazaDbRowsToCards(normalizeRows(data)), count ?? 0, page, pageSize)
}

/** Chazas con campaña destacada vigente (franja en /explorar); no altera el mazo del swiper. */
export async function listFeaturedChazasNow(supabase: SupabaseClient): Promise<ChazaCard[]> {
  const nowIso = new Date().toISOString()
  const { data, error } = await supabase
    .from("chazas")
    .select(CHAZA_SELECT)
    .eq("status", "published")
    .gt("featured_until", nowIso)
    .order("featured_rank", { ascending: true })

  if (error) {
    throwRepositoryError("listFeaturedChazasNow", error.message)
  }
  const rows = normalizeRows(data)
  const cards = chazaDbRowsToCards(rows)
  const rankBySlug = new Map(rows.map((r) => [r.slug, r.featured_rank ?? 999999]))
  return [...cards].sort((a, b) => {
    const da = rankBySlug.get(a.slug) ?? 999999
    const db = rankBySlug.get(b.slug) ?? 999999
    if (da !== db) return da - db
    return a.name.localeCompare(b.name, "es")
  })
}

export async function getChazaBySlugDb(supabase: SupabaseClient, slug: string): Promise<ChazaCard | null> {
  const { data, error } = await supabase.from("chazas").select(CHAZA_SELECT).eq("slug", slug).maybeSingle()

  if (error) {
    throwRepositoryError("getChazaBySlugDb", error.message)
  }
  if (!data) return null
  return chazaDbToCard(data as unknown as ChazaWithRelations)
}

export async function getChazasByCategorySlugDb(
  supabase: SupabaseClient,
  categorySlug: string
): Promise<ChazaCard[]> {
  const all = await listPublishedChazas(supabase)
  return all.filter((c) => (c.categorySlugs ?? []).includes(categorySlug))
}

export async function listAllPublishedSlugs(supabase: SupabaseClient): Promise<string[]> {
  const { data, error } = await supabase.from("chazas").select("slug").eq("status", "published")
  if (error) {
    throwRepositoryError("listAllPublishedSlugs", error.message)
  }
  if (!data) return []
  return data.map((r: { slug: string }) => r.slug)
}

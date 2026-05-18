import type { SupabaseClient } from "@supabase/supabase-js"
import type { ChazaWithRelations } from "@/types/database"
import { chazaDbToCard, chazaDbRowsToCards } from "@/lib/data/chaza-mapper"
import type { ChazaCard } from "@/types/chaza"

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
    console.error("[supabase-chaza-repository] listPublishedChazas", error.message)
    return []
  }
  return chazaDbRowsToCards(normalizeRows(data))
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
    console.error("[supabase-chaza-repository] listFeaturedChazasNow", error.message)
    return []
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
    console.error("[supabase-chaza-repository] getChazaBySlugDb", error.message)
    return null
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
  if (error || !data) return []
  return data.map((r: { slug: string }) => r.slug)
}

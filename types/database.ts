/** Filas Supabase (public) — alineadas a la migracion inicial. */

export interface CategoryRow {
  id: string
  slug: string
  name: string
  sort_order: number
}

export interface ChazaRow {
  id: string
  owner_id: string
  slug: string
  name: string
  description: string
  location_text: string
  schedule: string
  cover_image_url: string | null
  map_position: { x: number; y: number } | null
  geo: { lat: number; lng: number } | null
  building_code: string | null
  contact_whatsapp: string | null
  contact_instagram: string | null
  tags: string[] | null
  rating: number
  review_count: number
  status: string
  created_at: string
  updated_at: string
  verified_at: string | null
  featured_until: string | null
  featured_rank: number | null
}

export interface ChazaCategoryJoinRow {
  category_id: string
  categories: CategoryRow | null
}

export interface ChazaProductRow {
  id: string
  chaza_id: string
  name: string
  price_label: string | null
  sort_order: number
}

/** Resultado del select anidado de Supabase */
export interface ChazaWithRelations extends ChazaRow {
  chaza_categories: ChazaCategoryJoinRow[] | null
  chaza_products: ChazaProductRow[] | null
}

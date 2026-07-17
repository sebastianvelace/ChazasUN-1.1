// Capa anticorrupción (mapper): traduce la fila cruda de la base de datos
// (snake_case, columnas jsonb sin garantía de forma) al tipo de dominio ChazaCard
// (camelCase, tipado y con valores por defecto seguros). Aísla el resto de la app
// de cómo está guardada la información: si mañana cambia el esquema, solo se toca
// este archivo, no cada componente que consume una chaza.
import type { ChazaCard } from "@/types/chaza"
import type { ChazaWithRelations } from "@/types/database"
import { getCategoryBySlug } from "@/config/categories"

// map_position es una columna jsonb: Postgres NO valida su forma, así que puede
// llegar cualquier cosa. Validamos que x/y sean números finitos antes de confiar
// en ellos; si no, devolvemos undefined en vez de propagar datos corruptos.
function parseMapPosition(raw: unknown): { x: number; y: number } | undefined {
  if (!raw || typeof raw !== "object") return undefined
  const o = raw as Record<string, unknown>
  const x = Number(o.x)
  const y = Number(o.y)
  if (Number.isFinite(x) && Number.isFinite(y)) return { x, y }
  return undefined
}

function parseGeo(raw: unknown): { lat: number; lng: number } | undefined {
  if (!raw || typeof raw !== "object") return undefined
  const o = raw as Record<string, unknown>
  const lat = Number(o.lat)
  const lng = Number(o.lng)
  if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
  return undefined
}

// La tarjeta muestra un "precio desde". Como no hay una columna de precio en la
// chaza, lo derivamos del producto con la etiqueta de precio más corta (heurística:
// la más corta suele ser la más barata/simple). Si ningún producto tiene precio,
// caemos a "Consultar" en vez de dejar la tarjeta vacía.
function priceFromProducts(products: ChazaWithRelations["chaza_products"]): string {
  if (!products?.length) return "Consultar"
  const withPrice = products
    .map((p) => p.price_label?.trim())
    .filter((x): x is string => Boolean(x && x.length))
  if (withPrice.length === 0) return "Consultar"
  return withPrice.sort((a, b) => a.length - b.length)[0] ?? "Consultar"
}

export function chazaDbToCard(row: ChazaWithRelations): ChazaCard {
  const joins = row.chaza_categories ?? []
  const slugArr: string[] = []
  const nameArr: string[] = []
  for (const j of joins) {
    const raw = j.categories
    const c = Array.isArray(raw) ? raw[0] : raw
    if (c?.slug) slugArr.push(c.slug)
    if (c?.name) nameArr.push(c.name)
  }
  const primaryCategory = nameArr[0] ?? (slugArr[0] ? getCategoryBySlug(slugArr[0])?.name : undefined) ?? "Chaza"

  const tags = Array.isArray(row.tags) ? row.tags : []

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    category: primaryCategory,
    categorySlugs: slugArr.length ? slugArr : undefined,
    location: row.location_text ?? "",
    rating: row.rating ?? 0,
    reviews: row.review_count ?? 0,
    image: row.cover_image_url?.trim() || "/icon.svg",
    tags: tags.length ? tags : ["Chaza"],
    schedule: row.schedule ?? "",
    price: priceFromProducts(row.chaza_products),
    mapPosition: parseMapPosition(row.map_position) ?? undefined,
    geo: parseGeo(row.geo) ?? undefined,
    buildingCode: row.building_code ?? undefined,
    contactWhatsApp: row.contact_whatsapp ?? undefined,
    contactInstagram: row.contact_instagram ?? undefined,
    verifiedAt: row.verified_at ?? null,
  }
}

export function chazaDbRowsToCards(rows: ChazaWithRelations[]): ChazaCard[] {
  return rows.map(chazaDbToCard)
}

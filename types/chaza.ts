/** Chaza — puesto de venta en campus (entidad principal del marketplace). */

export type ChazaStatus = "draft" | "published" | "paused" | "suspended"

export interface ChazaProduct {
  id: string
  name: string
  priceCents: number | null
  priceLabel: string | null
  description?: string
  imageUrl?: string
  isAvailable: boolean
  sortOrder: number
}

export interface Chaza {
  id: string
  slug: string
  name: string
  description: string
  shortDescription?: string
  categoryIds: string[]
  categoryLabels: string[]
  locationText: string
  /** Pin movible por el chazero (porcentaje 0–100 sobre imagen del mapa). */
  mapPosition?: { x: number; y: number }
  coverImageUrl: string
  tags: string[]
  schedule: string
  /** Precio destacado para tarjeta (ej. "Desde $1.500"). */
  priceFromLabel: string
  rating: number
  reviewCount: number
  contactWhatsApp?: string
  contactInstagram?: string
  status: ChazaStatus
  products?: ChazaProduct[]
}

/** Vista simplificada para swiper / tarjetas (mock y listados). */
export interface ChazaCard {
  id: string
  slug: string
  name: string
  description: string
  category: string
  /** Slugs de categorias (multiples). Si falta, se infiere del nombre `category`. */
  categorySlugs?: string[]
  location: string
  rating: number
  reviews: number
  image: string
  tags: string[]
  schedule: string
  price: string
  /** Posicion en el plano del campus (0–100 %). */
  mapPosition?: { x: number; y: number }
  /** Coordenadas para abrir en Google Maps. */
  geo?: { lat: number; lng: number }
  buildingCode?: string
  /** Contacto publico (demo local; Fase 1 en DB). */
  contactWhatsApp?: string
  contactInstagram?: string
  /** ISO fecha si el equipo marco la chaza como verificada en ChazasUN */
  verifiedAt?: string | null
}

export type SwipeAction = "like" | "pass" | "save" | "undo"

import { campusConfig } from "@/config/campus"
import type { ChazaCard } from "@/types/chaza"

const CENTER_PERCENT = { x: 50, y: 50 }

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function posOrCenter(c: ChazaCard): { x: number; y: number } {
  return c.mapPosition ?? CENTER_PERCENT
}

/**
 * Recomendados: primero likes (orden de likes), luego mas cercanas en el plano al ancla
 * (ultima chaza likeada con pin, o centro del campus). Sin ranking por populares.
 */
export function recommendChazas(likedIds: string[], catalog: ChazaCard[], max = 24): ChazaCard[] {
  const byId = new Map(catalog.map((c) => [c.id, c]))
  const likedCards: ChazaCard[] = []
  for (const id of likedIds) {
    const c = byId.get(id)
    if (c && !likedCards.some((x) => x.id === c.id)) likedCards.push(c)
  }

  let anchor = CENTER_PERCENT
  for (let i = likedCards.length - 1; i >= 0; i--) {
    if (likedCards[i].mapPosition) {
      anchor = likedCards[i].mapPosition!
      break
    }
  }

  const used = new Set(likedCards.map((c) => c.id))
  const rest = catalog.filter((c) => !used.has(c.id) && c.mapPosition)
  rest.sort((a, b) => dist(posOrCenter(a), anchor) - dist(posOrCenter(b), anchor))

  const out = [...likedCards, ...rest]
  return out.slice(0, max)
}

/** Geo de referencia para lugares sin pin (enlace Google Maps generico al campus). */
export function defaultGeoForCard(): { lat: number; lng: number } {
  return { lat: campusConfig.center.lat, lng: campusConfig.center.lng }
}

import { mergeChazaCatalogClient } from "@/lib/data/chaza-repository"
import { slugify } from "@/lib/utils/slugify"
import { campusConfig } from "@/config/campus"

export function uniqueChazaSlugFromSet(name: string, existingSlugs: Set<string>): string {
  const base = slugify(name) || "chaza"
  let s = base
  let i = 1
  while (existingSlugs.has(s)) {
    s = `${base}-${i++}`
  }
  return s
}

export function uniqueChazaSlug(name: string): string {
  const base = slugify(name) || "chaza"
  const all = mergeChazaCatalogClient()
  const slugs = new Set(all.map((c) => c.slug))
  return uniqueChazaSlugFromSet(name, slugs)
}

export function geoFromMapPercent(x: number, y: number): { lat: number; lng: number } {
  const c = campusConfig.center
  return {
    lat: c.lat + (y - 50) * 0.00015,
    lng: c.lng + (x - 50) * 0.00015,
  }
}

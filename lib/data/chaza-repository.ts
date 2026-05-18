import type { ChazaCard } from "@/types/chaza"
import { mockChazaCards } from "@/lib/constants/mock-chazas"
import { getPublishedChazasFromStorage } from "@/lib/data/local-chaza-store"
import { categories } from "@/config/categories"

/** Slugs del catalogo estatico (SSR, generateStaticParams). */
export function getSeedChazaCards(): ChazaCard[] {
  return mockChazaCards
}

/** Merge: chazas publicadas en LS primero (mismo slug reemplaza seed), luego resto del seed. Solo en cliente. */
export function mergeChazaCatalogClient(): ChazaCard[] {
  if (typeof window === "undefined") return mockChazaCards
  const published = getPublishedChazasFromStorage()
  const pubSlugs = new Set(published.map((c) => c.slug))
  const seedOnly = mockChazaCards.filter((c) => !pubSlugs.has(c.slug))
  return [...published, ...seedOnly]
}

export function getChazaBySlugClient(slug: string): ChazaCard | undefined {
  return mergeChazaCatalogClient().find((c) => c.slug === slug)
}

export function getChazasByCategorySlugClient(categorySlug: string): ChazaCard[] {
  const all = mergeChazaCatalogClient()
  return all.filter((c) => {
    const slugs = c.categorySlugs ?? inferCategorySlugsFromLabel(c.category)
    return slugs.includes(categorySlug)
  })
}

export function inferCategorySlugsFromLabel(label: string): string[] {
  const map: Record<string, string> = {
    "Cafe y Bebidas": "cafe-bebidas",
    Comida: "comida",
    "Comida Rapida": "comida",
    Servicios: "servicios",
    Papeleria: "papeleria",
    Libros: "libros",
    Libreria: "libros",
    Tecnologia: "tecnologia",
    Belleza: "belleza",
    "Ropa y Accesorios": "ropa-accesorios",
    "Arte y Manualidades": "arte-manualidades",
    Deportes: "deportes",
    Musica: "musica",
    Fotografia: "fotografia",
    Transporte: "transporte",
  }
  const slug = map[label]
  return slug ? [slug] : []
}

export function categorySlugExists(slug: string): boolean {
  return categories.some((c) => c.slug === slug)
}

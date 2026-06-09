"use client"

import { useState, useMemo } from "react"
import { Search, Heart } from "lucide-react"
import { categories } from "@/config/categories"
import { useFavorites } from "@/hooks/use-favorites"
import { ChazaGridCard } from "@/components/chazas/chaza-grid-card"
import { PageContainer, PageHeader } from "@/components/layout"
import type { ChazaCard } from "@/types/chaza"

interface ExplorarGridProps {
  items: ChazaCard[]
  initialCategory: string | null
}

export function ExplorarGrid({ items, initialCategory }: ExplorarGridProps) {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory)
  const { likedIds, addLike } = useFavorites()

  const filtered = useMemo(() => {
    let result = items

    if (activeCategory) {
      result = result.filter((c) => c.categorySlugs?.includes(activeCategory))
    }

    if (search.trim()) {
      const query = search.trim().toLowerCase()
      result = result.filter((c) => c.name.toLowerCase().includes(query))
    }

    return result
  }, [items, activeCategory, search])

  function handleCategoryClick(slug: string | null) {
    if (slug === null) {
      setActiveCategory(null)
      return
    }
    setActiveCategory((prev) => (prev === slug ? null : slug))
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Descubre"
        title="EXPLORA CHAZAS"
        description="Encuentra las chazas del campus."
      />

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar chaza..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red/50 transition"
        />
      </div>

      {/* Category pills — flex-wrap, never scrollable */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => handleCategoryClick(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeCategory === null
              ? "bg-brand-red text-white font-semibold"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Todas
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => handleCategoryClick(cat.slug)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat.slug
                ? "bg-brand-red text-white font-semibold"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Count line */}
      <p className="text-xs text-gray-400 mb-3">{filtered.length} chazas</p>

      {/* Grid or empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <p className="text-gray-500 text-sm">No hay chazas con ese filtro.</p>
          <button
            onClick={() => {
              setActiveCategory(null)
              setSearch("")
            }}
            className="px-5 py-2 rounded-full bg-brand-red text-white text-sm font-medium hover:bg-brand-red/90 transition-colors"
          >
            Ver todas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((chaza) => {
            const isLiked = likedIds.includes(chaza.id)
            return (
              <div key={chaza.id} className="relative">
                <ChazaGridCard chaza={chaza} />
                <button
                  onClick={() => addLike(chaza.id)}
                  aria-label={isLiked ? "Quitar de favoritos" : "Agregar a favoritos"}
                  className={`absolute bottom-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow transition-all ${
                    isLiked
                      ? "bg-brand-red text-white"
                      : "bg-white/90 text-gray-400 hover:text-brand-red"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </PageContainer>
  )
}

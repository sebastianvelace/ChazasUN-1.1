"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { PageContainer, PageHeader } from "@/components/layout"
import { CampusMap } from "@/components/map/campus-map"
import { useSession } from "@/hooks/use-session"
import { useFavorites } from "@/hooks/use-favorites"
import { categories } from "@/config/categories"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

export function MapaPageClient() {
  const searchParams = useSearchParams()
  const categoryFilter = searchParams.get("categoria")
  const { isLoggedIn } = useSession()
  const { likedIds } = useFavorites()
  const [onlyLikes, setOnlyLikes] = useState(false)

  const filterIds = isLoggedIn && onlyLikes ? likedIds : null
  const showLikesEmpty = isLoggedIn && onlyLikes && likedIds.length === 0

  const categoryLabel = useMemo(
    () => categories.find((c) => c.slug === categoryFilter)?.name,
    [categoryFilter]
  )

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Campus"
        title="MAPA DE CHAZAS"
        description={
          categoryLabel
            ? `Filtro: ${categoryLabel}. Toca un pin para ver detalle.`
            : "Plano de la sede Bogotá con puntos de ubicación. Filtra por categoría o por tus likes."
        }
      />

      <div
        className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
        aria-label="Filtrar mapa por categoría"
      >
        <Link
          href={siteConfig.urls.mapa}
          className={cn(
            "shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition-colors",
            !categoryFilter
              ? "border-brand-red bg-brand-red text-white"
              : "border-gray-200 text-gray-600 hover:border-brand-red"
          )}
        >
          Todas
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`${siteConfig.urls.mapa}?categoria=${c.slug}`}
            className={cn(
              "shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition-colors",
              categoryFilter === c.slug
                ? "bg-brand-red text-white border-brand-red"
                : "border-gray-200 text-gray-600 hover:border-brand-red"
            )}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {isLoggedIn && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={() => setOnlyLikes(false)}
            className={cn(
              "font-stencil text-sm px-4 py-2 rounded-full border-2 transition-colors",
              !onlyLikes
                ? "bg-brand-red text-white border-brand-red"
                : "border-gray-200 text-gray-600 hover:border-brand-red"
            )}
          >
            TODAS
          </button>
          <button
            type="button"
            onClick={() => setOnlyLikes(true)}
            className={cn(
              "font-stencil text-sm px-4 py-2 rounded-full border-2 transition-colors",
              onlyLikes
                ? "bg-brand-red text-white border-brand-red"
                : "border-gray-200 text-gray-600 hover:border-brand-red"
            )}
          >
            MIS LIKES
          </button>
        </div>
      )}

      {showLikesEmpty ? (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 mb-6 text-center">
          <p className="text-gray-700 text-sm mb-4">
            Aún no tienes likes. Explora chazas y marca las que te interesen para verlas aquí.
          </p>
          <Link
            href={siteConfig.urls.explorar}
            className="inline-block font-stencil bg-brand-red text-white px-6 py-2.5 rounded-full hover:bg-brand-red-dark"
          >
            IR A EXPLORAR
          </Link>
        </div>
      ) : (
        <CampusMap filterChazaIds={filterIds} categoryFilter={categoryFilter} />
      )}
    </PageContainer>
  )
}

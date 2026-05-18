"use client"

import Link from "next/link"
import { useMemo } from "react"
import { PageContainer, PageHeader } from "@/components/layout"
import { ChazaGridCard } from "@/components/chazas/chaza-grid-card"
import { useChazaCatalog } from "@/hooks/use-chaza-catalog"
import { useSession } from "@/hooks/use-session"
import { useFavorites } from "@/hooks/use-favorites"
import { recommendChazas } from "@/lib/data/recommendations"
import { siteConfig } from "@/config/site"

export function RecomendadosClient() {
  const { cards } = useChazaCatalog()
  const { isLoggedIn } = useSession()
  const { likedIds } = useFavorites()

  const recommended = useMemo(() => recommendChazas(likedIds, cards), [likedIds, cards])

  if (!isLoggedIn) {
    return (
      <PageContainer>
        <PageHeader
          eyebrow="Personalizado"
          title="RECOMENDADOS PARA TI"
          description="Segun tus likes y cercania en el mapa del campus. Sin ranking por populares."
        />
        <div className="rounded-3xl border border-gray-100 bg-gray-50 p-10 text-center text-gray-600 text-sm">
          <p className="mb-4">Inicia sesion para ver recomendaciones basadas en tus likes.</p>
          <Link
            href={siteConfig.urls.login}
            className="inline-block font-stencil bg-brand-red text-white px-8 py-3 rounded-full hover:bg-brand-red-dark"
          >
            INICIAR SESION
          </Link>
        </div>
      </PageContainer>
    )
  }

  if (likedIds.length === 0) {
    return (
      <PageContainer>
        <PageHeader
          eyebrow="Personalizado"
          title="RECOMENDADOS PARA TI"
          description="Explora y marca con like las que te interesen. Luego completamos sugerencias por cercania en el mapa."
        />
        <div className="rounded-3xl border border-gray-100 bg-gray-50 p-10 text-center">
          <Link
            href={siteConfig.urls.explorar}
            className="inline-block font-stencil bg-brand-red text-white px-8 py-3 rounded-full hover:bg-brand-red-dark"
          >
            EXPLORAR CHAZAS
          </Link>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Personalizado"
        title="RECOMENDADOS PARA TI"
        description="Primero tus likes; despues chazas cercanas en el plano. Igual visibilidad para todas en el explorador."
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recommended.map((c) => (
          <ChazaGridCard key={c.id} chaza={c} />
        ))}
      </div>
    </PageContainer>
  )
}

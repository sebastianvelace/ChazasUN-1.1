"use client"

import Link from "next/link"
import { useMemo } from "react"
import { Sparkles, Heart } from "lucide-react"
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
    const preview = cards.slice(0, 3)
    return (
      <PageContainer>
        <PageHeader
          eyebrow="Personalizado"
          title="RECOMENDADOS PARA TI"
          description="Da like en el explorador y te mostramos mas chazas como esas."
        />
        <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: "320px" }}>
          {preview.length > 0 && (
            <div
              className="grid grid-cols-3 gap-2 pointer-events-none select-none"
              style={{ filter: "blur(5px)", opacity: 0.55, maxHeight: "320px", overflow: "hidden" }}
            >
              {preview.map((c) => (
                <ChazaGridCard key={c.id} chaza={c} />
              ))}
            </div>
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/75 backdrop-blur-[2px] rounded-2xl z-10 px-6">
            <Sparkles className="w-12 h-12 text-brand-red" />
            <p className="font-stencil text-xl text-gray-800 tracking-wide">Recomendaciones basadas en tus gustos</p>
            <Link
              href={siteConfig.urls.login}
              className="inline-block font-stencil bg-brand-red text-white px-8 py-3 rounded-full hover:bg-brand-red-dark"
            >
              INICIAR SESION
            </Link>
            <Link
              href={siteConfig.urls.explorar}
              className="text-sm text-gray-500 hover:text-brand-red transition-colors"
            >
              Explorar sin cuenta →
            </Link>
          </div>
        </div>
      </PageContainer>
    )
  }

  if (likedIds.length === 0) {
    const preview = cards.slice(0, 3)
    return (
      <PageContainer>
        <PageHeader
          eyebrow="Personalizado"
          title="RECOMENDADOS PARA TI"
          description="Explora y marca con like las que te interesen. Luego completamos sugerencias por cercania en el mapa."
        />
        <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: "320px" }}>
          {preview.length > 0 && (
            <div
              className="grid grid-cols-3 gap-2 pointer-events-none select-none"
              style={{ filter: "blur(3px)", opacity: 0.65, maxHeight: "320px", overflow: "hidden" }}
            >
              {preview.map((c) => (
                <ChazaGridCard key={c.id} chaza={c} />
              ))}
            </div>
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/75 backdrop-blur-[2px] rounded-2xl z-10 px-6">
            <Heart className="w-12 h-12 text-brand-red" />
            <p className="font-stencil text-xl text-gray-800 tracking-wide">¡Dale like a las que te interesan!</p>
            <p className="text-sm text-gray-500 text-center max-w-xs">
              Ve al explorador, desliza a la derecha en las chazas que te gusten, y aqui apareceran tus recomendados.
            </p>
            <Link
              href={siteConfig.urls.explorar}
              className="inline-block font-stencil bg-brand-red text-white px-8 py-3 rounded-full hover:bg-brand-red-dark"
            >
              IR A EXPLORAR
            </Link>
          </div>
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

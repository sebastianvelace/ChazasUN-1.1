"use client"

import Link from "next/link"
import { useMemo } from "react"
import { PageContainer, PageHeader } from "@/components/layout"
import { ChazaGridCard } from "@/components/chazas/chaza-grid-card"
import { useChazaCatalog } from "@/hooks/use-chaza-catalog"
import { useSession } from "@/hooks/use-session"
import { useFavorites } from "@/hooks/use-favorites"
import { siteConfig } from "@/config/site"

import { getSupabaseBrowserEnv } from "@/lib/supabase/env"

export function GuardadasClient() {
  const { cards } = useChazaCatalog()
  const { isLoggedIn } = useSession()
  const { savedIds } = useFavorites()
  const useSupabase = Boolean(getSupabaseBrowserEnv())

  const saved = useMemo(() => {
    const set = new Set(savedIds)
    return cards.filter((c) => set.has(c.id))
  }, [cards, savedIds])

  if (!isLoggedIn) {
    return (
      <PageContainer>
        <PageHeader
          eyebrow="Tu cuenta"
          title="CHAZAS GUARDADAS"
          description={
            useSupabase
              ? "Inicia sesion para ver tus guardados sincronizados con tu cuenta."
              : "Inicia sesion para ver y sincronizar tus guardados (modo demo en este navegador)."
          }
        />
        <div className="rounded-3xl border border-gray-100 bg-gray-50 p-10 text-center">
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

  if (saved.length === 0) {
    return (
      <PageContainer>
        <PageHeader
          eyebrow="Guardados"
          title="CHAZAS GUARDADAS"
          description="Aun no guardaste ninguna. En el explorador, toca el icono de marcador."
        />
        <div className="rounded-3xl border border-gray-100 bg-gray-50 p-10 text-center">
          <Link
            href={siteConfig.urls.explorar}
            className="inline-block font-stencil bg-brand-red text-white px-8 py-3 rounded-full hover:bg-brand-red-dark"
          >
            IR A EXPLORAR
          </Link>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Guardados"
        title="CHAZAS GUARDADAS"
        description={`${saved.length} chaza${saved.length === 1 ? "" : "s"} en tu lista.`}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {saved.map((c) => (
          <ChazaGridCard key={c.id} chaza={c} />
        ))}
      </div>
    </PageContainer>
  )
}

import { mockChazaCards } from "@/lib/constants/mock-chazas"
import { ChazaDetailClient } from "@/components/chazas/chaza-detail-client"
import { ChazaDetailState } from "@/components/chazas/chaza-detail-state"
import { createPublicSupabaseClient } from "@/lib/supabase/public"
import {
  getChazaBySlugDb,
  listAllPublishedSlugs,
} from "@/lib/data/supabase-chaza-repository"

interface PageProps {
  params: Promise<{ slug: string }>
}

export const dynamicParams = true

// Override server-only para previews/e2e; producción nunca usa mocks por defecto.
const forceDemoCatalog = process.env.CHAZAS_USE_MOCK_DATA === "true"
const canUseDemoCatalog = process.env.NODE_ENV !== "production" || forceDemoCatalog

export async function generateStaticParams() {
  if (forceDemoCatalog) return mockChazaCards.map((chaza) => ({ slug: chaza.slug }))

  const supabase = createPublicSupabaseClient()
  if (supabase) {
    try {
      const slugs = await listAllPublishedSlugs(supabase)
      return slugs.map((slug) => ({ slug }))
    } catch (error) {
      console.error("[chaza-detail] No fue posible generar los slugs remotos.", error)
    }
  }
  return canUseDemoCatalog ? mockChazaCards.map((c) => ({ slug: c.slug })) : []
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  if (forceDemoCatalog) {
    const mock = mockChazaCards.find((chaza) => chaza.slug === slug)
    return { title: mock ? `${mock.name}` : "Chaza" }
  }

  const supabase = createPublicSupabaseClient()
  if (supabase) {
    try {
      const chaza = await getChazaBySlugDb(supabase, slug)
      if (chaza) {
        return { title: `${chaza.name}`, description: chaza.description.slice(0, 160) }
      }
    } catch {
      return { title: "Chaza temporalmente no disponible" }
    }
  }
  const mock = canUseDemoCatalog ? mockChazaCards.find((c) => c.slug === slug) : undefined
  return { title: mock ? `${mock.name}` : "Chaza" }
}

export default async function ChazaDetailPage({ params }: PageProps) {
  const { slug } = await params
  if (forceDemoCatalog) {
    const exists = mockChazaCards.some((chaza) => chaza.slug === slug)
    return exists ? <ChazaDetailClient slug={slug} /> : <ChazaDetailState kind="not-found" />
  }

  const supabase = createPublicSupabaseClient()
  let remoteChazaExists: boolean | null = null
  let remoteLookupFailed = false

  if (supabase) {
    try {
      const chaza = await getChazaBySlugDb(supabase, slug)
      remoteChazaExists = Boolean(chaza)
    } catch (error) {
      remoteLookupFailed = true
      console.error("[chaza-detail] No fue posible cargar el detalle.", error)
    }
  }

  if ((!supabase || remoteLookupFailed) && !canUseDemoCatalog) {
    return <ChazaDetailState kind="error" />
  }

  const shouldUseDemo = canUseDemoCatalog && (!supabase || remoteLookupFailed)
  const demoChazaExists = mockChazaCards.some((chaza) => chaza.slug === slug)
  if (remoteChazaExists === false || (shouldUseDemo && !demoChazaExists)) {
    return <ChazaDetailState kind="not-found" />
  }

  return <ChazaDetailClient slug={slug} />
}

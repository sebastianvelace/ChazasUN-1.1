import { mockChazaCards } from "@/lib/constants/mock-chazas"
import { ChazaDetailClient } from "@/components/chazas/chaza-detail-client"
import { createPublicSupabaseClient } from "@/lib/supabase/public"
import {
  getChazaBySlugDb,
  listAllPublishedSlugs,
} from "@/lib/data/supabase-chaza-repository"

interface PageProps {
  params: Promise<{ slug: string }>
}

export const dynamicParams = true

export async function generateStaticParams() {
  const supabase = createPublicSupabaseClient()
  if (supabase) {
    const slugs = await listAllPublishedSlugs(supabase)
    if (slugs.length) return slugs.map((slug) => ({ slug }))
  }
  return mockChazaCards.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const supabase = createPublicSupabaseClient()
  if (supabase) {
    const chaza = await getChazaBySlugDb(supabase, slug)
    if (chaza) return { title: `${chaza.name} | ChazasUN`, description: chaza.description.slice(0, 160) }
  }
  const mock = mockChazaCards.find((c) => c.slug === slug)
  return { title: mock ? `${mock.name} | ChazasUN` : "Chaza | ChazasUN" }
}

export default async function ChazaDetailPage({ params }: PageProps) {
  const { slug } = await params
  return <ChazaDetailClient slug={slug} />
}

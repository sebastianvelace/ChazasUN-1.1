import { ChazaSwiper } from "@/components/chazas"
import { CatalogLoadState } from "@/components/chazas/catalog-load-state"
import { getChazasAction, getFeaturedChazasAction } from "@/lib/actions/chazas"

export const metadata = {
  title: "Explorar chazas",
  description: "Descubre chazas del campus con un feed tipo swiper.",
}

export default async function ExplorarPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const { categoria } = await searchParams
  const [chazasResult, featuredResult] = await Promise.allSettled([
    getChazasAction(),
    getFeaturedChazasAction(),
  ])

  if (chazasResult.status === "rejected") {
    console.error("[explorar] No fue posible cargar el catálogo.", chazasResult.reason)
    return <CatalogLoadState showHomeLink className="my-16 sm:my-24" />
  }

  const featured = featuredResult.status === "fulfilled" ? featuredResult.value : []
  if (featuredResult.status === "rejected") {
    console.error("[explorar] No fue posible cargar las chazas destacadas.", featuredResult.reason)
  }

  return (
    <ChazaSwiper
      items={chazasResult.value}
      featuredStrip={featured}
      categoryFilter={categoria ?? null}
      showNameSearch
      showViewAllLink={false}
    />
  )
}

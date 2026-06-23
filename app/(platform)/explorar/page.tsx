import { ChazaSwiper } from "@/components/chazas"
import { getChazasAction, getFeaturedChazasAction } from "@/lib/actions/chazas"

export const metadata = {
  title: "Explorar chazas | ChazasUN",
  description: "Descubre chazas del campus con un feed tipo swiper.",
}

export default async function ExplorarPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const { categoria } = await searchParams
  const [chazas, featured] = await Promise.all([getChazasAction(), getFeaturedChazasAction()])

  return (
    <ChazaSwiper
      items={chazas}
      featuredStrip={featured}
      categoryFilter={categoria ?? null}
      showNameSearch
      showViewAllLink={false}
    />
  )
}

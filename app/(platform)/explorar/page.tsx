import { ChazaSwiper } from "@/components/chazas"
import { PageContainer } from "@/components/layout"
import { getChazasAction, getFeaturedChazasAction } from "@/lib/actions/chazas"

export const metadata = {
  title: "Explorar chazas | ChazasUN",
  description: "Descubre chazas del campus con el explorador interactivo.",
}

export default async function ExplorarPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const { categoria } = await searchParams
  const [chazas, featuredStrip] = await Promise.all([getChazasAction(), getFeaturedChazasAction()])

  return (
    <PageContainer className="py-0 px-0 max-w-none">
      <ChazaSwiper
        items={chazas}
        categoryFilter={categoria ?? null}
        showSectionHeader
        showViewAllLink={false}
        showNameSearch
        featuredStrip={featuredStrip}
      />
    </PageContainer>
  )
}

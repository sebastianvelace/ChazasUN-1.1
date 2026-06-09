import { ExplorarGrid } from "@/components/chazas/explorar-grid"
import { getChazasAction } from "@/lib/actions/chazas"

export const metadata = {
  title: "Explorar chazas | ChazasUN",
  description: "Todas las chazas del campus en una parrilla.",
}

export default async function ExplorarPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const { categoria } = await searchParams
  const chazas = await getChazasAction()

  return <ExplorarGrid items={chazas} initialCategory={categoria ?? null} />
}

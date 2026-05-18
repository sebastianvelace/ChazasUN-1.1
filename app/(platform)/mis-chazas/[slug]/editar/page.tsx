import Link from "next/link"
import { getChazaForEditAction } from "@/lib/actions/my-chazas"
import { EditChazaForm } from "@/components/chazas/edit-chaza-form"
import { PageContainer, PageHeader } from "@/components/layout"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  return { title: `Editar ${slug} | ChazasUN` }
}

export default async function EditarChazaPage({ params }: PageProps) {
  const { slug } = await params
  const res = await getChazaForEditAction(slug)
  const menuVisionEnabled =
    process.env.ENABLE_MENU_VISION === "true" && Boolean(process.env.GROQ_API_KEY)

  if (!res.ok) {
    return (
      <PageContainer>
        <PageHeader eyebrow="Chazero" title="EDITAR CHAZA" description="No pudimos cargar esta ficha." />
        <p className="text-sm text-gray-600 mb-6">{res.error}</p>
        <Link href="/mis-chazas" className="text-brand-red font-semibold hover:underline">
          Volver a mis chazas
        </Link>
      </PageContainer>
    )
  }

  const { data } = res

  if (data.status === "suspended") {
    return (
      <PageContainer>
        <PageHeader
          eyebrow="Chazero"
          title="CHAZA SUSPENDIDA"
          description="Un administrador suspendio esta publicacion por moderacion."
        />
        <p className="text-sm text-gray-600 mb-6">
          Si crees que fue un error, escribe al equipo de ChazasUN desde los canales oficiales.
        </p>
        <Link href="/mis-chazas" className="text-brand-red font-semibold hover:underline">
          Volver a mis chazas
        </Link>
      </PageContainer>
    )
  }

  return (
    <PageContainer size="md">
      <PageHeader eyebrow="Editar" title={data.name.toUpperCase()} description="Actualiza tu informacion visible." />
      <EditChazaForm slug={slug} initial={data} menuVisionEnabled={menuVisionEnabled} />
    </PageContainer>
  )
}

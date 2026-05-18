import Link from "next/link"
import { listMyChazasAction } from "@/lib/actions/my-chazas"
import { MisChazaListRow } from "@/components/chazas/mis-chaza-list-row"
import { PageContainer, PageHeader } from "@/components/layout"
import { siteConfig } from "@/config/site"

export const metadata = {
  title: "Mis chazas | ChazasUN",
}

export default async function MisChazasPage() {
  const res = await listMyChazasAction()

  if (!res.ok) {
    return (
      <PageContainer>
        <PageHeader
          eyebrow="Chazero"
          title="MIS CHAZAS"
          description="Gestiona tus puestos publicados en ChazasUN."
        />
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {res.error === "Inicia sesion." ? (
            <>
              Necesitas una cuenta.{" "}
              <Link href={siteConfig.urls.login} className="font-semibold text-brand-red underline">
                Iniciar sesion
              </Link>
            </>
          ) : (
            res.error
          )}
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Chazero"
        title="MIS CHAZAS"
        description="Edita datos, pin en mapa, comparte enlace o QR, o pausa tu publicacion."
      />
      {res.items.length === 0 ? (
        <div className="rounded-3xl border border-gray-100 bg-gray-50 p-10 text-center">
          <p className="text-gray-600 text-sm mb-6">Aun no publicas ninguna chaza.</p>
          <Link
            href={siteConfig.urls.publicarChaza}
            className="inline-block font-stencil bg-brand-red text-white px-8 py-3 rounded-full hover:bg-brand-red-dark"
          >
            PUBLICAR CHAZA
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {res.items.map((c) => (
            <MisChazaListRow key={c.id} chaza={c} />
          ))}
        </ul>
      )}
    </PageContainer>
  )
}

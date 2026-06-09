import Link from "next/link"
import { Store, MapPin, Heart, BarChart2, PlusCircle } from "lucide-react"
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
    if (res.error === "Inicia sesion.") {
      return (
        <PageContainer>
          <div className="flex flex-col items-center text-center gap-6 py-16">
            <Store className="w-16 h-16 text-brand-red" />
            <div>
              <h1 className="font-stencil text-3xl sm:text-4xl text-gray-900 tracking-wide mb-3">
                PUBLICA TU CHAZA
              </h1>
              <p className="text-gray-500 max-w-sm mx-auto text-sm leading-relaxed">
                Registra tu puesto en ChazasUN y llega a cientos de estudiantes del campus.
              </p>
            </div>
            <ul className="flex flex-col gap-3 text-sm text-gray-600 text-left">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-red shrink-0" />
                Aparece en el mapa del campus
              </li>
              <li className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-brand-red shrink-0" />
                Recibe likes y guardadas
              </li>
              <li className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-brand-red shrink-0" />
                Ve tus metricas de visitas
              </li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`${siteConfig.urls.registro}?next=/mis-chazas`}
                className="inline-block font-stencil bg-brand-red text-white px-8 py-3 rounded-full hover:bg-brand-red-dark text-center"
              >
                CREAR CUENTA
              </Link>
              <Link
                href={`${siteConfig.urls.login}?next=/mis-chazas`}
                className="inline-block font-stencil border border-brand-red text-brand-red px-8 py-3 rounded-full hover:bg-brand-red/5 text-center"
              >
                INICIAR SESION
              </Link>
            </div>
            <Link
              href={siteConfig.urls.explorar}
              className="text-sm text-gray-400 hover:text-brand-red transition-colors"
            >
              Solo quiero explorar →
            </Link>
          </div>
        </PageContainer>
      )
    }
    return (
      <PageContainer>
        <PageHeader
          eyebrow="Chazero"
          title="MIS CHAZAS"
          description="Gestiona tus puestos publicados en ChazasUN."
        />
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {res.error}
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
        <div className="flex flex-col items-center text-center gap-5 py-14">
          <PlusCircle className="w-14 h-14 text-gray-300" />
          <div>
            <p className="font-stencil text-xl text-gray-700 tracking-wide mb-1">
              Aun no tienes chazas publicadas
            </p>
            <p className="text-gray-400 text-sm">
              Publica tu primer puesto en menos de 5 minutos.
            </p>
          </div>
          <Link
            href={siteConfig.urls.publicarChaza}
            className="inline-block font-stencil bg-brand-red text-white px-8 py-3 rounded-full hover:bg-brand-red-dark"
          >
            PUBLICAR MI PRIMERA CHAZA
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

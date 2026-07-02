import { Suspense } from "react"
import { MapaPageClient } from "@/components/map/mapa-page-client"

export const metadata = {
  title: "Mapa del campus",
  description: "Ubica chazas en el plano de la UN Bogota y abre direcciones en Google Maps.",
}

export default function MapaPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-gray-500 text-sm">Cargando mapa…</p>}>
      <MapaPageClient />
    </Suspense>
  )
}

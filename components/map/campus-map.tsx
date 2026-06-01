"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, ExternalLink, Star } from "lucide-react"
import { campusConfig } from "@/config/campus"
import { useChazaCatalog } from "@/hooks/use-chaza-catalog"
import {
  googleMapsCampusUrl,
  googleMapsPlaceUrl,
  hasGoogleMapsApiKey,
} from "@/lib/maps/google-maps"
import type { ChazaCard } from "@/types/chaza"
import { cn } from "@/lib/utils"
import { useAnalytics } from "@/hooks/use-analytics"

interface CampusMapProps {
  className?: string
  /** Si se pasa, solo se muestran pins de esas chazas (ej. ids con like). */
  filterChazaIds?: string[] | null
  /** Filtra por slug de categoria (ej. comida). */
  categoryFilter?: string | null
}

export function CampusMap({
  className,
  filterChazaIds = null,
  categoryFilter = null,
}: CampusMapProps) {
  const { cards } = useChazaCatalog()
  const [selected, setSelected] = useState<ChazaCard | null>(null)
  const { track } = useAnalytics()

  const chazasWithMap = useMemo(() => {
    let withPins = cards.filter((c) => c.mapPosition)
    if (categoryFilter) {
      withPins = withPins.filter((c) => (c.categorySlugs ?? []).includes(categoryFilter))
    }
    if (filterChazaIds?.length) {
      const set = new Set(filterChazaIds)
      withPins = withPins.filter((c) => set.has(c.id))
    }
    return withPins
  }, [cards, filterChazaIds, categoryFilter])

  return (
    <div className={cn("flex flex-col lg:flex-row gap-6", className)}>
      <div className="relative flex-1 rounded-3xl border border-gray-100 overflow-hidden bg-gray-50 shadow-lg">
        <div className="relative w-full aspect-[3/2] sm:aspect-[16/9] min-h-[360px] sm:min-h-[480px] lg:min-h-[540px]">
          <Image
            src={campusConfig.mapImageUrl}
            alt="Mapa del campus UN Bogota"
            fill
            className="object-contain"
            priority
            sizes="(max-width: 1024px) 100vw, 70vw"
          />
          {chazasWithMap.map((chaza) => {
            const pos = chaza.mapPosition!
            const isActive = selected?.id === chaza.id
            return (
              <button
                key={chaza.id}
                type="button"
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-full z-10 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red",
                  isActive && "scale-125 z-20"
                )}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onClick={() => {
                  setSelected(chaza)
                  track("map_pin_click", { chazaId: chaza.id })
                }}
                aria-label={`Chaza ${chaza.name}`}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 border-white shadow-lg",
                    isActive ? "bg-brand-red" : "bg-brand-red/90"
                  )}
                >
                  <MapPin className="h-5 w-5 text-white" />
                </span>
              </button>
            )
          })}
        </div>
        <p className="text-xs text-gray-400 px-4 py-2 border-t bg-white">
          Plano UN Bogota. Chazas con pin aparecen al publicar o en datos de demo.
        </p>
      </div>

      <aside className="lg:w-80 flex-shrink-0">
        {selected ? (
          <ChazaMapCard chaza={selected} onClose={() => setSelected(null)} />
        ) : (
          <div className="rounded-3xl border border-gray-100 bg-gray-50 p-6 min-h-[200px] flex items-center justify-center">
            <p className="text-gray-500 text-sm text-center">
              {chazasWithMap.length === 0
                ? "No hay chazas en este filtro. Prueba ver todas."
                : "Toca un pin para ver la chaza y abrir Google Maps."}
            </p>
          </div>
        )}

        <a
          href={googleMapsCampusUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-gray-200 text-sm font-medium text-gray-700 hover:border-brand-red hover:text-brand-red transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Abrir campus en Google Maps
        </a>

        {hasGoogleMapsApiKey() && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            API key detectada: mapa Google embebido en fase siguiente.
          </p>
        )}
      </aside>
    </div>
  )
}

function ChazaMapCard({ chaza, onClose }: { chaza: ChazaCard; onClose: () => void }) {
  const mapsUrl = chaza.geo
    ? googleMapsPlaceUrl(chaza.geo.lat, chaza.geo.lng, chaza.name)
    : googleMapsCampusUrl()

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-lg">
      <button type="button" onClick={onClose} className="text-xs text-gray-400 hover:text-brand-red mb-3">
        ← Cerrar
      </button>
      <h3 className="font-stencil text-xl text-brand-red mb-1">{chaza.name}</h3>
      {chaza.buildingCode && (
        <p className="text-xs text-brand-red/70 mb-2">Edificio {chaza.buildingCode}</p>
      )}
      <p className="text-sm text-gray-600 mb-3">{chaza.location}</p>
      <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        {chaza.rating} · {chaza.reviews} reseñas
      </div>
      <div className="flex flex-col gap-2">
        <Link
          href={`/chazas/${chaza.slug}`}
          className="font-stencil text-center bg-brand-red text-white py-2.5 rounded-full text-sm hover:bg-brand-red-dark"
        >
          VER CHAZA
        </Link>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 rounded-full border border-gray-200 text-sm hover:border-brand-red hover:text-brand-red"
        >
          <ExternalLink className="w-4 h-4" />
          Google Maps
        </a>
      </div>
    </div>
  )
}

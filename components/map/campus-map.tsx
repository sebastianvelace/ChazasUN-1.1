"use client"

import { useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, ExternalLink, RotateCcw, Star } from "lucide-react"
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
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const viewportRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ pointerId: number; x: number; y: number; originX: number; originY: number } | null>(null)
  const MIN_ZOOM = 1
  const MAX_ZOOM = 3
  const ZOOM_STEP = 0.5

  const clampOffset = (x: number, y: number) => {
    const rect = viewportRef.current?.getBoundingClientRect()
    if (!rect || zoom <= 1) return { x: 0, y: 0 }
    const maxX = (rect.width * (zoom - 1)) / 2
    const maxY = (rect.height * (zoom - 1)) / 2
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    }
  }

  const changeZoom = (nextZoom: number) => {
    const value = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, nextZoom))
    setZoom(value)
    if (value === 1) setOffset({ x: 0, y: 0 })
  }

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
        <div
          ref={viewportRef}
          className={cn(
            "relative min-h-[360px] w-full overflow-hidden aspect-[3/2] sm:min-h-[480px] sm:aspect-[16/9] lg:min-h-[540px]",
            zoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"
          )}
          style={{ touchAction: zoom > 1 ? "none" : "pan-y" }}
          onPointerDown={(event) => {
            if (zoom <= 1 || (event.target as HTMLElement).closest("button, a")) return
            dragRef.current = {
              pointerId: event.pointerId,
              x: event.clientX,
              y: event.clientY,
              originX: offset.x,
              originY: offset.y,
            }
            event.currentTarget.setPointerCapture(event.pointerId)
          }}
          onPointerMove={(event) => {
            const drag = dragRef.current
            if (!drag || drag.pointerId !== event.pointerId) return
            setOffset(
              clampOffset(
                drag.originX + event.clientX - drag.x,
                drag.originY + event.clientY - drag.y
              )
            )
          }}
          onPointerUp={(event) => {
            if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null
          }}
          onPointerCancel={() => {
            dragRef.current = null
          }}
        >
          <div
            style={{
              transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
              transformOrigin: "center center",
              transition: "transform 0.2s ease-out",
            }}
            className="absolute inset-0"
          >
            <Image
              src={campusConfig.mapImageUrl}
              alt="Mapa del campus UN Bogotá"
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
                  <span className="relative flex h-11 w-11 items-center justify-center">
                    {isActive && (
                      <span className="absolute inset-1 rounded-full bg-brand-red animate-ping opacity-30" />
                    )}
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full border-2 border-white shadow-lg sm:h-9 sm:w-9",
                        isActive ? "bg-brand-red" : "bg-brand-red/90"
                      )}
                    >
                      <MapPin className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          {/* Zoom controls */}
          <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => changeZoom(zoom + ZOOM_STEP)}
              disabled={zoom >= MAX_ZOOM}
              className="w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 font-bold text-lg hover:bg-gray-50 disabled:opacity-40"
              aria-label="Acercar"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => changeZoom(zoom - ZOOM_STEP)}
              disabled={zoom <= MIN_ZOOM}
              className="w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 font-bold text-lg hover:bg-gray-50 disabled:opacity-40"
              aria-label="Alejar"
            >
              −
            </button>
            {zoom > 1 && (
              <button
                type="button"
                onClick={() => {
                  setZoom(1)
                  setOffset({ x: 0, y: 0 })
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-lg hover:bg-gray-50"
                aria-label="Restablecer mapa"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <p className="border-t bg-white px-4 py-2 text-xs text-gray-500">
          Plano UN Bogotá. Acerca y arrastra para recorrer el campus.
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
        {chaza.rating} ({chaza.reviews} reseñas)
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

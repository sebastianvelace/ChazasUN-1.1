"use client"

import Link from "next/link"
import Image from "next/image"
import { MapPin, Star, Clock } from "lucide-react"
import type { ChazaCard } from "@/types/chaza"
import { ChazaVerifiedBadge } from "@/components/chazas/chaza-verified-badge"

interface ChazaGridCardProps {
  chaza: ChazaCard
  className?: string
}

/** Tarjeta compacta alineada al estilo del swiper (lista / grids). */
export function ChazaGridCard({ chaza, className = "" }: ChazaGridCardProps) {
  return (
    <Link
      href={`/chazas/${chaza.slug}`}
      className={`group block rounded-3xl overflow-hidden border border-border bg-background shadow-sm hover:shadow-md hover:border-brand-red/10 transition-all duration-300 ${className}`}
    >
      <div className="relative aspect-[4/5]">
        <Image
          src={chaza.image}
          alt={chaza.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 280px"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 z-10">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0 max-w-[55%] sm:max-w-[65%]">
            <span className="bg-brand-red text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg shrink-0">
              {chaza.category}
            </span>
            {chaza.verifiedAt ? <ChazaVerifiedBadge size="compact" className="shadow-md" /> : null}
          </div>
          <div className="flex items-center gap-1 bg-background/95 px-2.5 py-1.5 rounded-full shadow shrink-0">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-semibold text-foreground">{chaza.rating}</span>
            <span className="text-xs text-muted-foreground">({chaza.reviews})</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <h3 className="font-stencil text-xl text-white mb-2 tracking-wide drop-shadow-lg group-hover:underline">
            {chaza.name}
          </h3>
          <div className="flex items-center gap-1.5 text-white/80 text-xs mb-2">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="line-clamp-1">{chaza.location}</span>
          </div>
          <div className="flex items-center gap-2 text-white/70 text-xs mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span className="line-clamp-1">{chaza.schedule}</span>
          </div>
          <span className="inline-block bg-white/20 backdrop-blur-sm text-white font-semibold text-sm px-3 py-1 rounded-full">
            Desde {chaza.price}
          </span>
        </div>
      </div>
    </Link>
  )
}

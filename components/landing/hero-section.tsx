"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MapPin, Star, Heart, Bookmark } from "lucide-react"

const enter = (mounted: boolean, delay = "") =>
  `transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${delay} ${
    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
  }`

export function HeroSection({
  chazasPublished = 50,
  reviewsPublished = 120,
}: {
  chazasPublished?: number
  reviewsPublished?: number
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const stats = [
    { value: String(chazasPublished), label: "Chazas activas" },
    ...(reviewsPublished > 0 ? [{ value: String(reviewsPublished), label: "Reseñas" }] : []),
    { value: "4.8", label: "Calidad promedio" },
  ]

  return (
    <section id="inicio" className="relative bg-brand-red overflow-hidden">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,0.4) 39px,rgba(255,255,255,0.4) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,0.4) 39px,rgba(255,255,255,0.4) 40px)",
        }}
        aria-hidden="true"
      />
      {/* Floating blobs */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-float" aria-hidden="true" />
      <div className="absolute bottom-32 right-12 w-56 h-56 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-16 pb-0">
        <div className="flex flex-col lg:flex-row lg:items-center gap-12 xl:gap-16">

          {/* ── LEFT: Copy ── */}
          <div className="flex-1 min-w-0 py-10 lg:py-20">
            <span className={`inline-block bg-white/20 text-white text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-7 ${enter(mounted)}`}>
              Marketplace universitario
            </span>

            <h1 className={`font-stencil leading-[0.88] mb-7 ${enter(mounted, "delay-75")}`}>
              <span className="block text-7xl sm:text-8xl lg:text-[7.5rem] xl:text-[8.5rem] text-white">
                CHAZAS
              </span>
              <span className="block text-7xl sm:text-8xl lg:text-[7.5rem] xl:text-[8.5rem] text-white/40">
                UN
              </span>
            </h1>

            <p className={`text-white/85 text-xl leading-relaxed mb-10 max-w-md font-sans ${enter(mounted, "delay-150")}`}>
              El marketplace de los estudiantes de la{" "}
              <strong className="text-white font-semibold">Universidad Nacional</strong>.
              Comida, servicios, libros y más — todo en un mismo lugar.
            </p>

            <div className={`flex flex-col sm:flex-row gap-3 mb-14 ${enter(mounted, "delay-300")}`}>
              <Link
                href="/explorar"
                className="font-stencil text-lg bg-white text-brand-red px-8 py-4 rounded-2xl hover:bg-gray-50 transition-colors duration-300 shadow-xl text-center tracking-wide"
              >
                EXPLORAR CHAZAS
              </Link>
              <Link
                href="/publicar-chaza"
                className="font-stencil text-lg border-2 border-white/30 text-white px-8 py-4 rounded-2xl hover:bg-white/10 hover:border-white/50 transition-colors duration-300 text-center tracking-wide"
              >
                REGISTRAR MI CHAZA
              </Link>
            </div>

            {/* Stats */}
            <div className={`flex items-center gap-10 border-t border-white/15 pt-8 ${enter(mounted, "delay-500")}`}>
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="font-stencil text-3xl text-white">{s.value}</p>
                  <p className="text-white/45 text-xs mt-0.5 uppercase tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Floating chaza card preview ── */}
          <div className={`hidden lg:block lg:flex-none lg:w-[290px] xl:w-[320px] relative py-16 self-center ${enter(mounted, "delay-200")}`}>

            {/* Main card — tilted */}
            <div className="-rotate-3 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              {/* Image area — warm gradient simulating a food photo */}
              <div
                className="h-52 relative"
                style={{
                  background:
                    "linear-gradient(155deg,#7c2d12 0%,#b91c1c 25%,#c2410c 55%,#ea580c 80%,#fb923c 100%)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-25"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.4) 0%, transparent 55%)",
                  }}
                  aria-hidden="true"
                />
                {/* Top badges */}
                <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2">
                  <span className="bg-brand-red text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                    Cafe y Bebidas
                  </span>
                  <div className="flex items-center gap-1 bg-white/95 px-2.5 py-1.5 rounded-full shadow shrink-0">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-semibold text-gray-800">4.8</span>
                    <span className="text-xs text-gray-400">(142)</span>
                  </div>
                </div>
                {/* LIKE stamp overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-4 border-green-400 rounded-2xl px-6 py-2 -rotate-[15deg] bg-green-400/20 backdrop-blur-sm shadow-2xl">
                    <span className="text-green-400 font-stencil text-3xl tracking-widest drop-shadow-lg">
                      LIKE
                    </span>
                  </div>
                </div>
              </div>

              {/* Info area */}
              <div className="bg-white px-5 pt-4 pb-5">
                <h3 className="font-stencil text-xl text-gray-900 mb-1.5 tracking-wide">
                  El Rincón del Tinto
                </h3>
                <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-3">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Edificio de Ingeniería, piso 1</span>
                </div>
                <span className="inline-block bg-gray-100 text-gray-700 text-sm font-semibold px-3 py-1 rounded-full">
                  Desde $1.500
                </span>
              </div>
            </div>

            {/* Floating badge — Me interesa */}
            <div
              className="hidden lg:flex absolute -left-10 top-[42%] bg-white rounded-2xl shadow-2xl px-4 py-2.5 items-center gap-2 animate-float rotate-1"
              style={{ animationDelay: "0.8s", animationDuration: "3.5s" }}
              aria-hidden="true"
            >
              <Heart className="w-4 h-4 text-green-500 fill-green-500" />
              <span className="text-sm font-semibold text-gray-800">Me interesa</span>
            </div>

            {/* Floating badge — Guardada */}
            <div
              className="hidden lg:flex absolute -right-8 bottom-24 bg-brand-red-dark rounded-2xl shadow-2xl px-4 py-2.5 items-center gap-2 animate-float -rotate-1"
              style={{ animationDelay: "0.2s", animationDuration: "4.5s" }}
              aria-hidden="true"
            >
              <Bookmark className="w-4 h-4 text-white/80" />
              <span className="text-white text-xs font-semibold">Guardada</span>
            </div>
          </div>

        </div>
      </div>

      {/* Wave separator */}
      <div className="relative h-16 bg-brand-red">
        <svg
          viewBox="0 0 1440 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute bottom-0 w-full"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 64 L0 32 Q360 0 720 32 Q1080 64 1440 32 L1440 64 Z" fill="white" />
        </svg>
      </div>
    </section>
  )
}

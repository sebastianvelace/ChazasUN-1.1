"use client"

import Link from "next/link"
import { ArrowRight, MapPin, MousePointer2, Sparkles, Store, Utensils } from "lucide-react"
import { useGSAPSafe } from "@/hooks/use-gsap-reduced"

export function HeroSection({
  chazasPublished = 50,
  reviewsPublished = 120,
  featuredImage,
}: {
  chazasPublished?: number
  reviewsPublished?: number
  featuredImage?: string
}) {
  const containerRef = useGSAPSafe(({ isReduced, gsap }) => {
    if (isReduced) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } })
      tl.from(".hero-copy > *", { opacity: 0, y: 28, duration: 0.75, stagger: 0.08 })
        .from(".hero-card", { opacity: 0, y: 42, rotate: -4, scale: 0.92, duration: 0.9 }, "-=0.48")
        .from(".hero-orbit", { opacity: 0, scale: 0.75, duration: 0.55, stagger: 0.08 }, "-=0.42")
        .from(".hero-dock", { opacity: 0, y: 18, duration: 0.55 }, "-=0.35")

      gsap.to(".hero-card", {
        y: -46,
        rotate: 2.5,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      })

      gsap.to(".hero-orbit", {
        yPercent: (i) => (i % 2 === 0 ? -34 : 28),
        xPercent: (i) => (i % 2 === 0 ? 18 : -14),
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.6,
        },
      })
    }, containerRef)

    return () => ctx.revert()
  })

  const exploredPercent =
    chazasPublished > 0 ? Math.min(Math.round((reviewsPublished / (chazasPublished * 3)) * 100), 72) : 0
  const image = featuredImage || "/placeholder.svg"

  return (
    <section
      id="inicio"
      ref={containerRef}
      className="relative min-h-[100dvh] overflow-hidden bg-[#fbfbf9] px-4 pt-24 pb-10 sm:px-6 lg:px-8"
    >
      <div
        className="absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage:
            "linear-gradient(#d8d8d3 1px, transparent 1px), linear-gradient(90deg, #d8d8d3 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" aria-hidden="true" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-8.5rem)] max-w-7xl items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="hero-copy max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-red/15 bg-white/80 px-3.5 py-2 text-xs font-semibold text-brand-red shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Marketplace independiente · UN Bogotá
          </div>

          <h1 className="font-display text-[clamp(3.25rem,8vw,6.8rem)] font-black leading-[0.88] tracking-tight text-foreground">
            Come, imprime, repara y compra sin salir del campus.
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Descubre chazas reales con precios, ubicación y contacto directo en segundos.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/explorar"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-red px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-red/20 transition hover:bg-brand-red-dark active:scale-[0.98]"
            >
              Explorar
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/publicar-chaza"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/15 bg-white px-7 py-3.5 text-sm font-bold text-foreground shadow-sm transition hover:border-brand-red/30 hover:text-brand-red active:scale-[0.98]"
            >
              Publicar chaza
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[560px] lg:max-w-none">
          <div className="hero-orbit absolute -left-3 top-8 z-20 hidden rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-xl shadow-black/10 sm:flex sm:items-center sm:gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red text-white">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Ahora cerca</p>
              <p className="text-sm font-bold text-foreground">Almuerzo desde $8.000</p>
            </div>
          </div>

          <div className="hero-orbit absolute -right-2 bottom-24 z-20 hidden rounded-2xl border border-black/10 bg-[#101010] px-4 py-3 text-white shadow-xl shadow-black/20 sm:block">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">Sin filas</p>
            <p className="text-sm font-bold">Escribe por WhatsApp</p>
          </div>

          <div className="hero-card relative mx-auto aspect-[4/5] w-full max-w-[390px] overflow-hidden rounded-[2rem] border border-white/80 bg-foreground shadow-2xl shadow-black/25 sm:max-w-[430px]">
            <img src={image} alt="" className="h-full w-full object-cover" draggable={false} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
            <div className="absolute left-5 right-5 top-5 flex items-center justify-between gap-3">
              <span className="rounded-full bg-brand-red px-3 py-1.5 text-xs font-bold text-white shadow-lg">Destacada</span>
              <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-foreground shadow-lg">4.8 ★</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-6">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                <MapPin className="h-3.5 w-3.5" />
                Cerca de tu facultad
              </div>
              <h2 className="font-stencil text-4xl leading-none tracking-wide sm:text-5xl">Desliza y decide</h2>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/75">
                Like para recomendar, guardar para volver, mapa para llegar.
              </p>
            </div>
          </div>

          <div className="hero-dock mx-auto mt-5 grid max-w-[430px] grid-cols-3 gap-2 rounded-[1.6rem] border border-black/10 bg-white/90 p-2 shadow-xl shadow-black/10 backdrop-blur">
            <div className="rounded-[1.1rem] bg-[#f3f3ef] px-3 py-3">
              <p className="font-display text-2xl font-black text-foreground">{chazasPublished}</p>
              <p className="text-[11px] font-semibold text-muted-foreground">activas</p>
            </div>
            <div className="rounded-[1.1rem] bg-[#f3f3ef] px-3 py-3">
              <p className="font-display text-2xl font-black text-foreground">{exploredPercent}%</p>
              <p className="text-[11px] font-semibold text-muted-foreground">explorado</p>
            </div>
            <div className="rounded-[1.1rem] bg-brand-red px-3 py-3 text-white">
              <Store className="mb-1 h-5 w-5" />
              <p className="text-[11px] font-semibold text-white/80">gratis</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground">
            <MousePointer2 className="h-4 w-4 text-brand-red" />
            Primer swipe sin cuenta. Like y guardar protegen tu historial.
          </div>
        </div>
      </div>
    </section>
  )
}

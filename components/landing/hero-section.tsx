"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, MapPin, MousePointer2, Store } from "lucide-react"
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
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    setImageFailed(false)
  }, [featuredImage])

  const containerRef = useGSAPSafe(({ isReduced, gsap }) => {
    if (isReduced) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } })
      tl.from(".hero-copy > *", { opacity: 0, y: 28, duration: 0.75, stagger: 0.08 })
        .from(".hero-card", { opacity: 0, y: 42, rotate: -4, scale: 0.92, duration: 0.9 }, "-=0.48")
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
    }, containerRef)

    return () => ctx.revert()
  })

  const availableImage = imageFailed ? undefined : featuredImage

  return (
    <section
      id="inicio"
      ref={containerRef}
      className="relative min-h-[100dvh] overflow-hidden bg-[#fbfbf9] px-4 pt-24 pb-10 sm:px-6 lg:px-8"
    >
      <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-8.5rem)] max-w-7xl items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="hero-copy max-w-2xl space-y-6">
          <h1 className="font-display text-[clamp(3rem,7.5vw,6.4rem)] font-black leading-[0.95] tracking-tight text-foreground [text-wrap:balance]">
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
          <div className="hero-card relative mx-auto aspect-[4/5] w-full max-w-[390px] overflow-hidden rounded-[2rem] border border-white/80 bg-foreground shadow-2xl shadow-black/25 sm:max-w-[430px]">
            {availableImage ? (
              <Image
                src={availableImage}
                alt="Puesto destacado de la comunidad universitaria"
                fill
                sizes="(min-width: 1024px) 430px, (min-width: 640px) 430px, calc(100vw - 2rem)"
                className="object-cover"
                draggable={false}
                onError={() => setImageFailed(true)}
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 overflow-hidden bg-[#181816]" aria-label="Próximamente, una chaza destacada">
                <div
                  className="absolute inset-0 opacity-35"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, transparent 46%, rgba(255,255,255,.12) 47%, rgba(255,255,255,.12) 53%, transparent 54%)",
                    backgroundSize: "40px 40px",
                  }}
                  aria-hidden="true"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-28 w-28 rotate-[-5deg] items-center justify-center rounded-[2rem] border border-white/15 bg-brand-red text-white shadow-2xl shadow-black/30">
                    <Store className="h-12 w-12" strokeWidth={1.75} />
                  </div>
                </div>
                <p className="absolute inset-x-6 top-[66%] text-center text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                  La próxima chaza destacada puede ser la tuya
                </p>
              </div>
            )}
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
              <p className="font-display text-2xl font-black text-foreground">{reviewsPublished}</p>
              <p className="text-[11px] font-semibold text-muted-foreground">reseñas</p>
            </div>
            <div className="rounded-[1.1rem] bg-brand-red px-3 py-3 text-white">
              <Store className="mb-1 h-5 w-5" />
              <p className="text-[11px] font-semibold text-white/80">sin costo</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground">
            <MousePointer2 className="h-4 w-4 text-brand-red" />
            Explora sin cuenta. Inicia sesión solo para guardar y recomendar.
          </div>
        </div>
      </div>
    </section>
  )
}

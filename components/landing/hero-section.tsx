"use client"

import Link from "next/link"
import { TrendingUp } from "lucide-react"
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
  const containerRef = useGSAPSafe(({ isReduced, gsap, ScrollTrigger }) => {
    if (isReduced) return

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

    tl.from(".hero-badge", { opacity: 0, y: -12, duration: 0.4 })
      .from(".hero-title", { opacity: 0, y: 28, duration: 0.6 }, "-=0.2")
      .from(".hero-subtitle", { opacity: 0, y: 16, duration: 0.5 }, "-=0.3")
      .from(".hero-cta", { opacity: 0, y: 12, scale: 0.96, duration: 0.4, stagger: 0.1 }, "-=0.3")
      .from(".hero-card", { opacity: 0, x: 40, rotateY: -8, duration: 0.8, ease: "back.out(1.2)" }, "-=0.4")
      .from(".hero-stats", { opacity: 0, y: 8, duration: 0.4, stagger: 0.08 }, "-=0.3")

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom top",
      scrub: 1,
      onUpdate: (self) => {
        gsap.set(".hero-card", { y: self.progress * -20 })
      },
    })
  })

  const stats = {
    chazasPublished: String(chazasPublished),
    averageRating: "4.8",
  }

  const exploredPercent = chazasPublished > 0
    ? Math.min(Math.round((reviewsPublished / (chazasPublished * 3)) * 100), 72)
    : 0

  return (
    <section
      id="inicio"
      ref={containerRef}
      className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden px-6 pb-16"
      style={{
        background: 'var(--background)',
        backgroundImage: 'radial-gradient(circle, var(--border-color) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    >
      {/* Overlay para suavizar el grid en los bordes */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background pointer-events-none" />

      {/* Línea decorativa eyebrow */}
      <div className="hero-badge relative z-10 flex items-center gap-4 mb-8">
        <div className="h-px w-12 bg-gray-300" />
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Marketplace Universitario · Bogotá
        </span>
        <div className="h-px w-12 bg-border" />
      </div>

      {/* Título principal */}
      <h1
        className="hero-title relative z-10 font-display font-black text-center leading-[0.9] tracking-tight text-foreground"
        style={{ fontSize: 'clamp(5rem, 14vw, 11rem)' }}
        aria-label="CHAZAS UN"
      >
        CHAZAS<br />
        <span className="text-brand-red">UN</span>
      </h1>

      {/* Línea horizontal bajo el título */}
      <div className="relative z-10 mt-6 mb-8 flex items-center gap-4 w-full max-w-xs">
        <div className="h-px flex-1 bg-border" />
        <div className="h-1.5 w-1.5 rounded-full bg-brand-red" />
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Subtítulo */}
      <p className="hero-subtitle relative z-10 text-muted-foreground text-base max-w-sm text-center leading-relaxed">
        Comida, servicios, libros y más —{" "}
        <strong className="text-foreground">directo de otros universitarios.</strong>
      </p>

      {/* CTAs */}
      <div className="hero-cta relative z-10 flex flex-wrap items-center justify-center gap-3 mt-8">
        <Link
          href="/explorar"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-primary-foreground shadow-lg transition hover:bg-brand-red hover:shadow-xl active:scale-95"
        >
          Explorar chazas
        </Link>
        <Link
          href="/publicar-chaza"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-muted-foreground shadow-sm transition hover:border-gray-400 hover:shadow-md active:scale-95"
        >
          Publicar mi chaza
        </Link>
      </div>

      {/* Zeigarnik progress — solo si hay datos */}
      {exploredPercent > 0 && (
        <div className="hero-badge relative z-10 mt-8 w-full max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-xs font-medium flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Campus siendo explorado
            </span>
            <span className="text-foreground text-xs font-bold">{exploredPercent}%</span>
          </div>
          <div className="zeigarnik-bar" style={{ "--progress-width": `${exploredPercent}%` } as React.CSSProperties} />
        </div>
      )}

      {/* Stats */}
      <div className="hero-stats relative z-10 mt-12 flex items-center justify-center gap-8 text-center">
        <div>
          <div className="text-3xl font-black font-display text-foreground leading-none">{stats.chazasPublished}</div>
          <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Chazas activas</div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <div className="text-3xl font-black font-display text-foreground leading-none">{stats.averageRating}★</div>
          <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Calidad promedio</div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <div className="text-3xl font-black font-display text-foreground leading-none">∞</div>
          <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Estudiantes</div>
        </div>
      </div>

      {/* Tarjeta decorativa flotante */}
      <div className="hero-card hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 select-none" aria-hidden="true">
        {/* Back card — peeking behind */}
        <div className="absolute inset-0 rounded-3xl bg-muted/60 border border-border shadow-md translate-x-4 translate-y-3 rotate-3" />
        {/* Front card */}
        <div className="relative w-72 rounded-3xl overflow-hidden shadow-xl border border-border -rotate-1 bg-background">
          {featuredImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={featuredImage} alt="" className="h-40 w-full object-cover" />
          ) : (
            <div className="h-40 bg-gradient-to-br from-amber-400 to-orange-500" />
          )}
          <div className="p-4">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-red bg-brand-red/10 px-2 py-0.5 rounded-full">
              Comida
            </span>
            <p className="font-display text-base text-foreground mt-1 leading-tight font-bold">El Rincón del Tinto</p>
            <p className="text-xs text-muted-foreground mt-0.5">Edificio Posgrados · Desde $2.000</p>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} className="w-3 h-3 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-xs text-muted-foreground ml-1">4.8</span>
            </div>
          </div>
        </div>
        {/* Swipe hint badge */}
        <div className="absolute -bottom-3 -right-3 bg-background rounded-full shadow-lg px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground border border-border">
          <span>👆</span> Desliza
        </div>
      </div>
    </section>
  )
}

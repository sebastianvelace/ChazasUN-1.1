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
      .from(".hero-letter", { opacity: 0, y: "110%", duration: 0.7, stagger: 0.04 }, "-=0.2")
      .from(".hero-letter-red", { opacity: 0, y: "110%", duration: 0.6, stagger: 0.05 }, "-=0.4")
      .from(".hero-subtitle", { opacity: 0, y: 16, duration: 0.5 }, "-=0.3")
      .from(".hero-cta", { opacity: 0, y: 12, scale: 0.96, duration: 0.4, stagger: 0.1 }, "-=0.3")
      .from(".hero-stats", { opacity: 0, y: 8, duration: 0.4, stagger: 0.08 }, "-=0.3")

    // CountUp: starts right as the stats fade in
    const chazasEl = gsap.utils.toArray<HTMLElement>(".stat-chazas-num")[0]
    const ratingEl = gsap.utils.toArray<HTMLElement>(".stat-rating-num")[0]
    if (chazasEl && ratingEl) {
      const c1 = { v: 0 }
      const c2 = { v: 0 }
      tl.call(() => {
        chazasEl.textContent = "0"
        ratingEl.textContent = "0.0★"
      }, undefined, "<")
        .to(c1, {
          v: chazasPublished,
          duration: 1.5,
          ease: "power2.out",
          onUpdate() { chazasEl.textContent = Math.round(c1.v).toString() },
        }, "<")
        .to(c2, {
          v: 4.8,
          duration: 1.5,
          ease: "power2.out",
          onUpdate() { ratingEl.textContent = c2.v.toFixed(1) + "★" },
        }, "<")
    }

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
        className="hero-title relative z-10 font-display font-black text-center tracking-tight text-foreground"
        style={{ fontSize: 'clamp(5rem, 14vw, 11rem)' }}
        aria-label="CHAZAS UN"
      >
        <span className="block overflow-hidden leading-[0.9]">
          {"CHAZAS".split("").map((l, i) => (
            <span key={i} className="hero-letter inline-block">{l}</span>
          ))}
        </span>
        <span className="block overflow-hidden leading-[0.9]">
          {"UN".split("").map((l, i) => (
            <span key={i} className="hero-letter-red inline-block text-brand-red">{l}</span>
          ))}
        </span>
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
          <div className="stat-chazas-num text-3xl font-black font-display text-foreground leading-none">{stats.chazasPublished}</div>
          <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Chazas activas</div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <div className="stat-rating-num text-3xl font-black font-display text-foreground leading-none">{stats.averageRating}★</div>
          <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Calidad promedio</div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <div className="text-3xl font-black font-display text-foreground leading-none">∞</div>
          <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Estudiantes</div>
        </div>
      </div>

    </section>
  )
}

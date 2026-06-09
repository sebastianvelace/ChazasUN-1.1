"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { TrendingUp } from "lucide-react"

const enter = (mounted: boolean, delay = "") =>
  `motion-enter ${delay} ${
    mounted ? "is-visible" : ""
  }`

export function HeroSection({
  chazasPublished = 50,
  reviewsPublished = 120,
  featuredImage,
}: {
  chazasPublished?: number
  reviewsPublished?: number
  featuredImage?: string
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const stats = [
    { value: String(chazasPublished), label: "Chazas activas" },
    ...(reviewsPublished > 0 ? [{ value: String(reviewsPublished), label: "Reseñas" }] : []),
    { value: "4.8★", label: "Calidad promedio" },
  ]

  const exploredPercent = chazasPublished > 0
    ? Math.min(Math.round((reviewsPublished / (chazasPublished * 3)) * 100), 72)
    : 0

  return (
    <section id="inicio" className="relative bg-brand-red overflow-hidden">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,0.6) 39px,rgba(255,255,255,0.6) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,0.6) 39px,rgba(255,255,255,0.6) 40px)",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(255,255,255,0.08)_0%,transparent_70%)]" aria-hidden="true" />
      <div className="absolute top-20 left-1/4 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDuration: "9s" }} aria-hidden="true" />
      <div className="absolute bottom-32 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDuration: "13s", animationDelay: "3.5s" }} aria-hidden="true" />
      <div className="absolute top-1/2 left-10 w-32 h-32 bg-white/3 rounded-full blur-2xl animate-float" style={{ animationDuration: "11s", animationDelay: "1.2s" }} aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-16 pb-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">
          {/* Left column: all existing content, left-aligned on desktop */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:flex-1">

          {/* Headline — Cormorant Garamond editorial */}
          <h1
            className={`font-hero mb-7 ${enter(mounted, "motion-delay-1")}`}
            aria-label="CHAZAS UN"
          >
            {/* Main word */}
            <span className="block text-[2.8rem] sm:text-[3.6rem] lg:text-[4.4rem] leading-none text-white font-semibold tracking-[-0.01em]">
              CHAZAS
            </span>

            {/* Rule + UN + Rule — editorial flanking */}
            <span className="flex items-center justify-center gap-3 mt-3">
              <span className="flex-1 max-w-[72px] h-px bg-white/30" aria-hidden="true" />
              <span className="font-hero text-[0.75rem] sm:text-[0.8rem] font-light tracking-[0.55em] text-white/55 uppercase">
                UN
              </span>
              <span className="flex-1 max-w-[72px] h-px bg-white/30" aria-hidden="true" />
            </span>
          </h1>

          <p className={`text-white/80 text-xl leading-relaxed mb-9 max-w-[480px] font-sans font-medium mx-auto ${enter(mounted, "motion-delay-2")}`}>
            El marketplace de los estudiantes de la{" "}
            <strong className="text-white font-bold">Universidad Nacional</strong>.
            Comida, servicios, libros y más.
          </p>

          {/* CTAs */}
          <div className={`flex flex-col sm:flex-row gap-3 mb-10 justify-center ${enter(mounted, "motion-delay-3")}`}>
            <Link
              href="/explorar"
              className="btn-white-shimmer font-stencil text-lg bg-white text-brand-red px-10 py-4 rounded-2xl
                         hover:bg-gray-50 transition-colors duration-300
                         shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-black/15
                         text-center tracking-wide active:scale-[0.97]
                         min-h-[56px] flex items-center justify-center hover-lift"
            >
              EXPLORAR CHAZAS
            </Link>
            <Link
              href="/publicar-chaza"
              className="glass-btn font-stencil text-lg text-white px-10 py-4 rounded-2xl
                         text-center tracking-wide active:scale-[0.97]
                         min-h-[56px] flex items-center justify-center hover-lift"
            >
              PUBLICAR MI CHAZA
            </Link>
          </div>

          {/* Zeigarnik progress — solo si hay datos */}
          {exploredPercent > 0 && (
            <div className={`mb-8 w-full max-w-md mx-auto ${enter(mounted, "motion-delay-4")}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/50 text-xs font-medium flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Campus siendo explorado
                </span>
                <span className="text-white/70 text-xs font-bold">{exploredPercent}%</span>
              </div>
              <div className="zeigarnik-bar" style={{ "--progress-width": `${exploredPercent}%` } as React.CSSProperties} />
            </div>
          )}

          {/* Stats — centered */}
          <div className={`flex flex-wrap items-center justify-center gap-8 border-t border-white/10 pt-7 w-full max-w-lg mx-auto ${enter(mounted, "motion-delay-4")}`}>
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`${i < stats.length - 1 ? "sm:pr-8 sm:border-r sm:border-white/10" : ""} hover-scale`}
                style={{ transitionDelay: `${500 + i * 80}ms` }}
              >
                <p className="font-stencil text-2xl sm:text-3xl text-white">{s.value}</p>
                <p className="text-white/40 text-[11px] mt-0.5 uppercase tracking-wider font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          </div>

          {/* Right column: decorative card mockup — desktop only */}
          <div className="hidden lg:flex lg:w-80 lg:shrink-0 items-center justify-center">
            <div className="relative select-none" aria-hidden="true">
              {/* Back card — peeking behind */}
              <div className="absolute inset-0 rounded-3xl bg-white/20 border border-white/30 shadow-xl translate-x-4 translate-y-3 rotate-3" />
              {/* Front card */}
              <div className="relative w-64 rounded-3xl overflow-hidden shadow-2xl border border-white/20 -rotate-1">
                {featuredImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={featuredImage} alt="" className="h-48 w-full object-cover" />
                ) : (
                  <div className="h-48 bg-gradient-to-br from-amber-400 to-orange-500" />
                )}
                <div className="bg-white p-4">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-red bg-brand-red/10 px-2 py-0.5 rounded-full">
                    Comida
                  </span>
                  <p className="font-stencil text-lg text-gray-900 mt-1 leading-tight">El Rincón del Tinto</p>
                  <p className="text-xs text-gray-500 mt-0.5">Edificio Posgrados · Desde $2.000</p>
                  <div className="flex items-center gap-1 mt-2">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} className="w-3 h-3 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-xs text-gray-500 ml-1">4.8</span>
                  </div>
                </div>
              </div>
              {/* Swipe hint badge */}
              <div className="absolute -bottom-3 -right-3 bg-white rounded-full shadow-lg px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <span>👆</span> Desliza
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Wave separator — block SVG + overlap avoids subpixel red seam */}
      <div className="relative h-16 bg-brand-red leading-none -mb-px">
        <svg
          viewBox="0 0 1440 65"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block w-full h-full"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 64 L0 32 Q360 0 720 32 Q1080 64 1440 32 L1440 64 L1440 65 L0 65 Z" fill="white" />
        </svg>
      </div>
    </section>
  )
}

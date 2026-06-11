"use client"

import { useRef } from "react"
import Link from "next/link"
import { TrendingUp } from "lucide-react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Register plugins once at module level (safe in Next.js client components)
gsap.registerPlugin(ScrollTrigger)

export function HeroSection({
  chazasPublished = 50,
  reviewsPublished = 120,
  featuredImage,
}: {
  chazasPublished?: number
  reviewsPublished?: number
  featuredImage?: string
}) {
  const containerRef = useRef<HTMLElement>(null)

  // Element refs for targeted animation
  const blob1Ref = useRef<HTMLDivElement>(null)
  const blob2Ref = useRef<HTMLDivElement>(null)
  const blob3Ref = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const stats = [
    { value: String(chazasPublished), label: "Chazas activas" },
    ...(reviewsPublished > 0 ? [{ value: String(reviewsPublished), label: "Reseñas" }] : []),
    { value: "4.8★", label: "Calidad promedio" },
  ]

  const exploredPercent = chazasPublished > 0
    ? Math.min(Math.round((reviewsPublished / (chazasPublished * 3)) * 100), 72)
    : 0

  useGSAP(
    () => {
      // Respect prefers-reduced-motion
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

      // ── A) Entrance timeline ──────────────────────────────────────────────
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      // 1. Headline
      tl.from(headlineRef.current, {
        opacity: 0,
        y: 24,
        duration: 0.6,
      })

      // 2. Subtitle/description
      tl.from(
        descRef.current,
        {
          opacity: 0,
          y: 16,
          duration: 0.5,
        },
        "-=0.35"
      )

      // 3. CTA buttons (stagger)
      if (ctaRef.current) {
        tl.from(
          ctaRef.current.querySelectorAll("a"),
          {
            opacity: 0,
            y: 12,
            scale: 0.96,
            duration: 0.4,
            stagger: 0.1,
          },
          "-=0.25"
        )
      }

      // 4. Progress bar (conditional)
      if (progressRef.current) {
        tl.from(
          progressRef.current,
          {
            opacity: 0,
            y: 8,
            duration: 0.35,
          },
          "-=0.2"
        )
      }

      // 5. Stats
      if (statsRef.current) {
        tl.from(
          statsRef.current.querySelectorAll("[data-stat]"),
          {
            opacity: 0,
            y: 8,
            duration: 0.35,
            stagger: 0.08,
          },
          "-=0.2"
        )
      }

      // 6. Decorative card (right column)
      if (cardRef.current) {
        tl.from(
          cardRef.current,
          {
            opacity: 0,
            x: 40,
            rotateY: -8,
            duration: 0.8,
            ease: "back.out(1.2)",
          },
          "-=0.7"
        )
      }

      // ── B) Blob floating animations ───────────────────────────────────────
      gsap.to(blob1Ref.current, {
        y: -20,
        duration: 6,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      })

      gsap.to(blob2Ref.current, {
        y: 15,
        duration: 8,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 1.5,
      })

      gsap.to(blob3Ref.current, {
        y: -12,
        duration: 7,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 0.8,
      })

      // ── C) Parallax on scroll ─────────────────────────────────────────────
      const scrollBase = {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1,
      }

      gsap.to(blob1Ref.current, {
        y: -60,
        ease: "none",
        scrollTrigger: scrollBase,
      })

      gsap.to(blob2Ref.current, {
        y: -48,
        ease: "none",
        scrollTrigger: scrollBase,
      })

      gsap.to(blob3Ref.current, {
        y: -36,
        ease: "none",
        scrollTrigger: scrollBase,
      })

      if (cardRef.current) {
        gsap.to(cardRef.current, {
          y: 20,
          ease: "none",
          scrollTrigger: scrollBase,
        })
      }
    },
    { scope: containerRef }
  )

  return (
    <section id="inicio" ref={containerRef} className="relative bg-brand-red overflow-hidden">
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

      {/* Blobs — float + parallax driven by GSAP (no animate-float CSS) */}
      <div ref={blob1Ref} className="absolute top-20 left-1/4 w-48 h-48 bg-white/5 rounded-full blur-3xl" aria-hidden="true" />
      <div ref={blob2Ref} className="absolute bottom-32 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" aria-hidden="true" />
      <div ref={blob3Ref} className="absolute top-1/2 left-10 w-32 h-32 bg-white/[0.03] rounded-full blur-2xl" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-16 pb-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">
          {/* Left column: all existing content, left-aligned on desktop */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:flex-1">

            {/* Headline — Barlow Condensed stencil brand */}
            <h1
              ref={headlineRef}
              className="font-stencil mb-7 leading-none tracking-wide"
              aria-label="CHAZAS UN"
            >
              <span className="block text-5xl sm:text-6xl lg:text-7xl text-white">
                CHAZAS
              </span>
              <span className="block text-xl sm:text-2xl lg:text-3xl text-white/70 tracking-[0.25em] mt-1">
                UN
              </span>
            </h1>

            <p ref={descRef} className="text-white/80 text-xl leading-relaxed mb-9 max-w-[480px] font-sans font-medium mx-auto">
              El marketplace de los estudiantes de la{" "}
              <strong className="text-white font-bold">Universidad Nacional</strong>.
              Comida, servicios, libros y más.
            </p>

            {/* CTAs */}
            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3 mb-10 justify-center">
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
              <div ref={progressRef} className="mb-8 w-full max-w-md mx-auto">
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
            <div ref={statsRef} className="flex flex-wrap items-center justify-center gap-8 border-t border-white/10 pt-7 w-full max-w-lg mx-auto">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  data-stat
                  className={`${i < stats.length - 1 ? "sm:pr-8 sm:border-r sm:border-white/10" : ""} hover-scale`}
                >
                  <p className="font-stencil text-2xl sm:text-3xl text-white">{s.value}</p>
                  <p className="text-white/40 text-[11px] mt-0.5 uppercase tracking-wider font-medium">{s.label}</p>
                </div>
              ))}
            </div>

          </div>

          {/* Right column: decorative card mockup — desktop only */}
          <div className="hidden lg:flex lg:w-80 lg:shrink-0 items-center justify-center">
            <div ref={cardRef} className="relative select-none" aria-hidden="true">
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

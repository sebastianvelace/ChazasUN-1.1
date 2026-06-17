"use client"

import Link from "next/link"
import { useState, useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { Flip } from "gsap/Flip"
import { useGSAPSafe } from "@/hooks/use-gsap-reduced"
import { categories } from "@/config/categories"
import { siteConfig } from "@/config/site"

gsap.registerPlugin(Flip)

// Bento layout metadata — indexed to match categories array order
const bentoMeta = [
  { gridClass: "md:col-span-2 md:row-span-2 md:col-start-1 md:row-start-1", nameClass: "text-2xl md:text-4xl", iconClass: "w-10 h-10 md:w-14 md:h-14" },
  { gridClass: "md:col-span-2 md:row-span-2 md:col-start-3 md:row-start-1", nameClass: "text-2xl md:text-4xl", iconClass: "w-10 h-10 md:w-14 md:h-14" },
  { gridClass: "md:col-start-5 md:row-start-1", nameClass: "text-sm md:text-base", iconClass: "w-6 h-6 md:w-8 md:h-8" },
  { gridClass: "md:col-start-6 md:row-start-1", nameClass: "text-sm md:text-base", iconClass: "w-6 h-6 md:w-8 md:h-8" },
  { gridClass: "md:col-start-5 md:row-start-2", nameClass: "text-sm md:text-base", iconClass: "w-6 h-6 md:w-8 md:h-8" },
  { gridClass: "md:col-span-2 md:row-span-2 md:col-start-1 md:row-start-3", nameClass: "text-2xl md:text-4xl", iconClass: "w-10 h-10 md:w-14 md:h-14" },
  { gridClass: "md:col-start-6 md:row-start-2", nameClass: "text-sm md:text-base", iconClass: "w-6 h-6 md:w-8 md:h-8" },
  { gridClass: "md:col-start-3 md:row-start-3", nameClass: "text-sm md:text-base", iconClass: "w-6 h-6 md:w-8 md:h-8" },
  { gridClass: "md:col-start-4 md:row-start-3", nameClass: "text-sm md:text-base", iconClass: "w-6 h-6 md:w-8 md:h-8" },
  { gridClass: "md:col-span-2 md:col-start-5 md:row-start-3", nameClass: "text-xl md:text-2xl", iconClass: "w-8 h-8 md:w-10 md:h-10" },
  { gridClass: "md:col-start-3 md:row-start-4", nameClass: "text-sm md:text-base", iconClass: "w-6 h-6 md:w-8 md:h-8" },
  { gridClass: "md:col-start-4 md:row-start-4", nameClass: "text-sm md:text-base", iconClass: "w-6 h-6 md:w-8 md:h-8" },
  { gridClass: "md:col-span-2 md:col-start-5 md:row-start-4", nameClass: "text-xl md:text-2xl", iconClass: "w-8 h-8 md:w-10 md:h-10" },
]

const filterGroups = [
  { id: "todos",     label: "Todos" },
  { id: "comida",    label: "Comida" },
  { id: "servicios", label: "Servicios" },
  { id: "objetos",   label: "Objetos" },
]

const categoryGroups: Record<string, string[]> = {
  comida:    ["cafe-bebidas", "comida"],
  servicios: ["servicios", "papeleria", "tecnologia", "belleza", "transporte"],
  objetos:   ["libros", "ropa-accesorios", "arte-manualidades", "deportes", "musica", "fotografia"],
}

export function CategoriesSection() {
  const [activeFilter, setActiveFilter] = useState("todos")
  const flipStateRef = useRef<ReturnType<typeof Flip.getState> | null>(null)

  const handleFilter = (filterId: string) => {
    if (filterId === activeFilter) return
    // Capture positions of ALL items before React re-renders
    flipStateRef.current = Flip.getState(".category-item")
    setActiveFilter(filterId)
  }

  // Runs synchronously after DOM update — Flip animates from captured → new positions
  useLayoutEffect(() => {
    if (!flipStateRef.current) return
    const state = flipStateRef.current
    flipStateRef.current = null

    Flip.from(state, {
      duration: 0.55,
      ease: "power2.inOut",
      stagger: 0.04,
      absolute: true,
      onEnter: (elements) =>
        gsap.fromTo(elements,
          { opacity: 0, scale: 0.88 },
          { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(1.4)" }
        ),
      onLeave: (elements) =>
        gsap.to(elements, { opacity: 0, scale: 0.88, duration: 0.2, ease: "power2.in" }),
    })
  }, [activeFilter])

  const containerRef = useGSAPSafe(({ isReduced, gsap, ScrollTrigger }) => {
    if (isReduced) return

    ScrollTrigger.batch(".categories-eyebrow", {
      onEnter: (els) => gsap.fromTo(els,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      ),
      once: true,
      start: "top bottom",
    })

    ScrollTrigger.batch(".categories-title", {
      onEnter: (els) => gsap.fromTo(els,
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", duration: 0.85, ease: "power2.inOut" }
      ),
      once: true,
      start: "top bottom",
    })

    ScrollTrigger.batch(".categories-filter-pills", {
      onEnter: (els) => gsap.fromTo(els,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }
      ),
      once: true,
      start: "top bottom",
    })

    ScrollTrigger.batch(".category-item", {
      onEnter: (elements) =>
        gsap.fromTo(elements,
          { opacity: 0, y: 28, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.06, ease: "power2.out" }
        ),
      once: true,
      start: "top bottom",
    })

    ScrollTrigger.batch(".categories-cta", {
      onEnter: (els) => gsap.fromTo(els,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      ),
      once: true,
      start: "top bottom",
    })
  })

  const isBento = activeFilter === "todos"

  return (
    <section ref={containerRef} id="categorias" className="relative py-20 sm:py-28 px-4 bg-background border-t border-border overflow-hidden">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <div className="categories-eyebrow flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-brand-red" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-red">Explora por categoría</span>
          </div>
          <h2 className="categories-title font-display font-black text-foreground leading-none tracking-tight" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
            TODO LO QUE<br />NECESITAS
          </h2>
        </div>

        {/* Filter pills */}
        <div className="categories-filter-pills flex flex-wrap gap-2 mb-10">
          {filterGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => handleFilter(group.id)}
              className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-widest transition-all duration-200 ${
                activeFilter === group.id
                  ? "bg-foreground text-primary-foreground shadow-sm scale-[1.03]"
                  : "bg-muted text-muted-foreground hover:bg-border hover:text-foreground"
              }`}
            >
              {group.label}
            </button>
          ))}
        </div>

        {/* Grid — bento in "todos", uniform in filtered view */}
        <div className={
          isBento
            ? "grid grid-cols-2 md:grid-cols-6 md:grid-rows-4 gap-3 [grid-auto-rows:110px] md:[grid-auto-rows:158px]"
            : "grid grid-cols-2 md:grid-cols-3 gap-3 [grid-auto-rows:130px]"
        }>
          {categories.map((cat, index) => {
            const isVisible = isBento || (categoryGroups[activeFilter]?.includes(cat.id) ?? false)
            const meta = isBento
              ? bentoMeta[index]
              : { gridClass: "", nameClass: "text-sm md:text-base", iconClass: "w-8 h-8" }
            const Icon = cat.icon
            return (
              <Link
                key={cat.id}
                href={`${siteConfig.urls.explorar}?categoria=${cat.slug}`}
                data-flip-id={cat.id}
                className={`category-item group relative overflow-hidden rounded-2xl border border-border bg-background p-6 transition-all duration-300 hover:border-foreground hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] cursor-pointer block ${meta.gridClass} ${!isVisible ? "hidden" : ""}`}
              >
                {/* Hover fill desde abajo */}
                <div className="absolute inset-0 bg-foreground translate-y-full transition-transform duration-300 group-hover:translate-y-0 rounded-2xl" aria-hidden="true" />

                {/* Card content */}
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="mb-4 text-brand-red transition-colors group-hover:text-white">
                    <Icon className={meta.iconClass} aria-hidden="true" />
                  </div>

                  <div className="flex items-end justify-between gap-1">
                    <h3 className={`font-display font-bold ${meta.nameClass} text-foreground transition-colors group-hover:text-white leading-none tracking-wide`}>
                      {cat.name}
                    </h3>
                    <span
                      className="text-transparent group-hover:text-white -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-base md:text-lg shrink-0 mb-0.5"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* CTA row */}
        <div className="categories-cta flex flex-col sm:flex-row items-center justify-between gap-6 mt-10 pt-8 border-t border-border">
          <p className="text-muted-foreground text-sm font-medium">
            ¿Tu chaza no aparece? Publícala gratis y sé el primero.
          </p>
          <Link
            href={siteConfig.urls.publicarChaza}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3 text-sm font-semibold uppercase tracking-widest text-primary-foreground hover:bg-brand-red transition-colors shrink-0"
          >
            PUBLICAR MI CHAZA →
          </Link>
        </div>

      </div>
    </section>
  )
}

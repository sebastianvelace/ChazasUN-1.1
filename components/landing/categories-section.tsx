"use client"

import Link from "next/link"
import { useGSAPSafe } from "@/hooks/use-gsap-reduced"
import { categories } from "@/config/categories"
import { siteConfig } from "@/config/site"

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

export function CategoriesSection() {
  const containerRef = useGSAPSafe(({ isReduced, gsap, ScrollTrigger }) => {
    if (isReduced) return

    gsap.from(".categories-header", {
      y: 24,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".categories-header",
        start: "top bottom",
        once: true,
      },
    })

    ScrollTrigger.batch(".category-item", {
      onEnter: (elements) => {
        gsap.fromTo(
          elements,
          { y: 28, scale: 0.97 },
          {
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.06,
            ease: "power2.out",
          }
        )
      },
      once: true,
      start: "top bottom",
    })
  })

  return (
    <section ref={containerRef} id="categorias" className="relative py-20 sm:py-28 px-4 bg-background border-t border-border overflow-hidden">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="categories-header mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-brand-red" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-red">Explora por categoría</span>
          </div>
          <h2 className="font-display font-black text-foreground leading-none tracking-tight" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
            TODO LO QUE<br />NECESITAS
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 md:grid-rows-4 gap-3 [grid-auto-rows:110px] md:[grid-auto-rows:158px]">
          {categories.map((cat, index) => {
            const meta = bentoMeta[index]
            const Icon = cat.icon
            return (
              <Link
                key={cat.id}
                href={`${siteConfig.urls.explorar}?categoria=${cat.slug}`}
                className={`category-item group relative overflow-hidden rounded-2xl border border-border bg-background p-6 transition-all duration-300 hover:border-foreground hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] cursor-pointer block ${meta.gridClass}`}
              >
                {/* Hover fill desde abajo */}
                <div className="absolute inset-0 bg-foreground translate-y-full transition-transform duration-300 group-hover:translate-y-0 rounded-2xl" aria-hidden="true" />

                {/* Card content */}
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="mb-4 text-brand-red transition-colors group-hover:text-white">
                    <Icon className={`${meta.iconClass}`} aria-hidden="true" />
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
        <div className="categories-header flex flex-col sm:flex-row items-center justify-between gap-6 mt-10 pt-8 border-t border-border">
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

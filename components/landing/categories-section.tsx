"use client"

import Link from "next/link"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { categories } from "@/config/categories"
import { siteConfig } from "@/config/site"

const SUBTLE_GRID =
  "repeating-linear-gradient(0deg,transparent,transparent 19px,rgba(255,255,255,1) 19px,rgba(255,255,255,1) 20px),repeating-linear-gradient(90deg,transparent,transparent 19px,rgba(255,255,255,1) 19px,rgba(255,255,255,1) 20px)"

// Bento layout metadata — indexed to match categories array order
// Explicit 6-col × 4-row placement (24 cells): 3× 2×2 featured + 8× 1×1 + 2× 2×1 wide
const bentoMeta = [
  // 0  Cafe y Bebidas
  { gridClass: "md:col-span-2 md:row-span-2 md:col-start-1 md:row-start-1", nameClass: "text-2xl md:text-4xl", iconClass: "w-10 h-10 md:w-14 md:h-14" },
  // 1  Comida
  { gridClass: "md:col-span-2 md:row-span-2 md:col-start-3 md:row-start-1", nameClass: "text-2xl md:text-4xl", iconClass: "w-10 h-10 md:w-14 md:h-14" },
  // 2  Servicios
  { gridClass: "md:col-start-5 md:row-start-1", nameClass: "text-sm md:text-base", iconClass: "w-6 h-6 md:w-8 md:h-8" },
  // 3  Papeleria
  { gridClass: "md:col-start-6 md:row-start-1", nameClass: "text-sm md:text-base", iconClass: "w-6 h-6 md:w-8 md:h-8" },
  // 4  Libros
  { gridClass: "md:col-start-5 md:row-start-2", nameClass: "text-sm md:text-base", iconClass: "w-6 h-6 md:w-8 md:h-8" },
  // 5  Tecnologia
  { gridClass: "md:col-span-2 md:row-span-2 md:col-start-1 md:row-start-3", nameClass: "text-2xl md:text-4xl", iconClass: "w-10 h-10 md:w-14 md:h-14" },
  // 6  Belleza
  { gridClass: "md:col-start-6 md:row-start-2", nameClass: "text-sm md:text-base", iconClass: "w-6 h-6 md:w-8 md:h-8" },
  // 7  Ropa y Accesorios
  { gridClass: "md:col-start-3 md:row-start-3", nameClass: "text-sm md:text-base", iconClass: "w-6 h-6 md:w-8 md:h-8" },
  // 8  Arte y Manualidades
  { gridClass: "md:col-start-4 md:row-start-3", nameClass: "text-sm md:text-base", iconClass: "w-6 h-6 md:w-8 md:h-8" },
  // 9  Deportes
  { gridClass: "md:col-span-2 md:col-start-5 md:row-start-3", nameClass: "text-xl md:text-2xl", iconClass: "w-8 h-8 md:w-10 md:h-10" },
  // 10 Musica
  { gridClass: "md:col-start-3 md:row-start-4", nameClass: "text-sm md:text-base", iconClass: "w-6 h-6 md:w-8 md:h-8" },
  // 11 Fotografia
  { gridClass: "md:col-start-4 md:row-start-4", nameClass: "text-sm md:text-base", iconClass: "w-6 h-6 md:w-8 md:h-8" },
  // 12 Transporte
  { gridClass: "md:col-span-2 md:col-start-5 md:row-start-4", nameClass: "text-xl md:text-2xl", iconClass: "w-8 h-8 md:w-10 md:h-10" },
]

export function CategoriesSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.08 })

  return (
    <section ref={ref} id="categorias" className="py-20 sm:py-28 px-4 bg-white overflow-hidden">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12 scroll-reveal-up ${isVisible ? "visible" : ""}`}>
          <div>
            <span className="inline-block bg-brand-red/10 text-brand-red text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
              Explora por categoría
            </span>
            <h2 className="font-stencil text-6xl sm:text-7xl md:text-8xl text-brand-red leading-none tracking-wide">
              CATEGORÍAS
            </h2>
          </div>
          <p className="text-gray-500 text-sm max-w-xs leading-relaxed sm:text-right sm:mb-2">
            Desde comida hasta tecnología — todo lo que necesitas en el campus.
          </p>
        </div>

        {/* Bento grid — 6-col × 4-row (24 cells, no gaps)
            Row 1: [Cafe 2×2][Comida 2×2][Serv][Papel]
            Row 2: [Cafe     ][Comida    ][Libr][Bell ]
            Row 3: [Tec 2×2 ][Ropa][Arte][Deportes 2×1]
            Row 4: [Tec      ][Mus ][Foto][Transporte 2×1]
        */}
        <div
          className="grid grid-cols-2 md:grid-cols-6 md:grid-rows-4 gap-3 [grid-auto-rows:110px] md:[grid-auto-rows:158px]"
        >
          {categories.map((cat, index) => {
            const meta = bentoMeta[index]
            const Icon = cat.icon
            return (
              <Link
                key={cat.id}
                href={`${siteConfig.urls.explorar}?categoria=${cat.slug}`}
                className={`group relative ${cat.colorClass} rounded-2xl overflow-hidden block transition-all duration-300 hover:scale-[1.025] hover:brightness-110 hover:shadow-2xl hover:shadow-black/50 ${meta.gridClass} scroll-reveal-scale ${isVisible ? "visible" : ""}`}
                style={{ transitionDelay: `${index * 35}ms` }}
              >
                {/* Subtle crosshatch texture */}
                <div
                  className="absolute inset-0 opacity-[0.055]"
                  style={{ backgroundImage: SUBTLE_GRID }}
                  aria-hidden="true"
                />

                {/* Hover vignette overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" aria-hidden="true" />

                {/* Card content */}
                <div className="relative z-10 h-full flex flex-col justify-between p-4 md:p-5">
                  {/* Icon — top */}
                  <Icon
                    className={`${meta.iconClass} text-white/65 group-hover:text-white/90 transition-colors duration-300`}
                    aria-hidden="true"
                  />

                  {/* Name + arrow — bottom */}
                  <div className="flex items-end justify-between gap-1">
                    <h3 className={`font-stencil ${meta.nameClass} text-white leading-none tracking-wide`}>
                      {cat.name}
                    </h3>
                    <span
                      className="text-white/0 group-hover:text-white/60 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-base md:text-lg shrink-0 mb-0.5"
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

        {/* CTA row — Gestalt: elemento separado visualmente con borde */}
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-6 mt-10 pt-8 border-t border-gray-100 scroll-reveal-up ${isVisible ? "visible" : ""}`}>
          <p className="text-gray-500 text-sm font-medium">
            ¿Tu chaza no aparece? Publícala gratis y sé el primero.
          </p>
          {/* Fitts: botón más grande, más fácil de clicar */}
          <Link
            href={siteConfig.urls.publicarChaza}
            className="btn-red-shimmer inline-flex items-center gap-2 font-stencil text-sm bg-brand-red text-white px-7 py-3.5 rounded-xl
                       hover:bg-brand-red-dark transition-colors duration-300 hover:-translate-y-0.5
                       hover:shadow-lg hover:shadow-brand-red/25 group shrink-0 active:scale-[0.97]
                       shadow-md shadow-brand-red/15"
          >
            <span>PUBLICAR MI CHAZA</span>
            <span className="group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true">→</span>
          </Link>
        </div>

      </div>
    </section>
  )
}

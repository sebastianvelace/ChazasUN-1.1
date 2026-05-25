"use client"

import Link from "next/link"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { categories } from "@/config/categories"
import { siteConfig } from "@/config/site"

const SUBTLE_GRID =
  "repeating-linear-gradient(0deg,transparent,transparent 19px,rgba(255,255,255,1) 19px,rgba(255,255,255,1) 20px),repeating-linear-gradient(90deg,transparent,transparent 19px,rgba(255,255,255,1) 19px,rgba(255,255,255,1) 20px)"

// Bento layout metadata — indexed to match categories array order
const bentoMeta = [
  // 0  Cafe y Bebidas — large feature
  { gridClass: "md:col-span-2 md:row-span-2", nameClass: "text-2xl md:text-4xl", iconClass: "w-10 h-10 md:w-14 md:h-14" },
  // 1  Comida
  { gridClass: "", nameClass: "text-sm md:text-base", iconClass: "w-6 h-6 md:w-8 md:h-8" },
  // 2  Servicios
  { gridClass: "", nameClass: "text-sm md:text-base", iconClass: "w-6 h-6 md:w-8 md:h-8" },
  // 3  Papeleria
  { gridClass: "", nameClass: "text-sm md:text-base", iconClass: "w-6 h-6 md:w-8 md:h-8" },
  // 4  Libros
  { gridClass: "", nameClass: "text-sm md:text-base", iconClass: "w-6 h-6 md:w-8 md:h-8" },
  // 5  Tecnologia — large feature
  { gridClass: "md:col-span-2 md:row-span-2", nameClass: "text-2xl md:text-4xl", iconClass: "w-10 h-10 md:w-14 md:h-14" },
  // 6  Belleza
  { gridClass: "", nameClass: "text-sm md:text-base", iconClass: "w-6 h-6 md:w-8 md:h-8" },
  // 7  Ropa y Accesorios
  { gridClass: "", nameClass: "text-sm md:text-base", iconClass: "w-6 h-6 md:w-8 md:h-8" },
  // 8  Arte y Manualidades — large feature
  { gridClass: "md:col-span-2 md:row-span-2", nameClass: "text-2xl md:text-4xl", iconClass: "w-10 h-10 md:w-14 md:h-14" },
  // 9  Deportes — wide
  { gridClass: "md:col-span-2", nameClass: "text-xl md:text-2xl", iconClass: "w-8 h-8 md:w-10 md:h-10" },
  // 10 Musica
  { gridClass: "", nameClass: "text-sm md:text-base", iconClass: "w-6 h-6 md:w-8 md:h-8" },
  // 11 Fotografia
  { gridClass: "", nameClass: "text-sm md:text-base", iconClass: "w-6 h-6 md:w-8 md:h-8" },
  // 12 Transporte — wide
  { gridClass: "md:col-span-2", nameClass: "text-xl md:text-2xl", iconClass: "w-8 h-8 md:w-10 md:h-10" },
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

        {/* Bento grid
            Layout (6-col, 4-row desktop):
            Row 1: [Cafe 2×2][Comida][Servicios][Papeleria][Libros]
            Row 2: [Cafe 2×2][Tec 2×2          ][Belleza  ][Ropa  ]
            Row 3: [Arte 2×2][Tec 2×2          ][Deportes 2×1     ]
            Row 4: [Arte 2×2][Musica][Fotografia][Transporte 2×1   ]
        */}
        <div
          className="grid grid-cols-2 md:grid-cols-6 gap-3 [grid-auto-rows:110px] md:[grid-auto-rows:158px]"
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

        {/* CTA row */}
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-6 mt-10 pt-8 border-t border-white/10 scroll-reveal-up ${isVisible ? "visible" : ""}`}>
          <p className="text-gray-500 text-sm">
            ¿No encuentras tu categoría? Publica y sé el primero.
          </p>
          <Link
            href={siteConfig.urls.publicarChaza}
            className="inline-flex items-center gap-2 font-stencil text-sm bg-brand-red text-white px-6 py-3 rounded-full hover:bg-brand-red-dark transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-brand-red/30 group shrink-0"
          >
            <span>PUBLICAR MI CHAZA</span>
            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </Link>
        </div>

      </div>
    </section>
  )
}

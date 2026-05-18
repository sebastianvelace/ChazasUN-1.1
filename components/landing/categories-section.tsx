"use client"

import Link from "next/link"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { categories } from "@/config/categories"
import { siteConfig } from "@/config/site"

export function CategoriesSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.1 })

  return (
    <section ref={ref} id="categorias" className="py-20 px-4 bg-gray-50">
      <div className="mx-auto max-w-6xl">
        <div className={`text-center mb-14 scroll-reveal-up ${isVisible ? "visible" : ""}`}>
          <span className="inline-block bg-brand-red/10 text-brand-red text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            Explora por categoria
          </span>
          <h2 className="font-stencil text-4xl sm:text-5xl text-brand-red mb-4 tracking-wide">
            TODAS LAS CATEGORIAS
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-base leading-relaxed">
            Una chaza puede aparecer en varias categorias. Todas tienen la misma visibilidad en el explorador.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat, index) => {
            const Icon = cat.icon
            return (
              <Link
                key={cat.id}
                href={`${siteConfig.urls.explorar}?categoria=${cat.slug}`}
                className={`group relative p-6 bg-white rounded-2xl border border-gray-100 hover:border-brand-red/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 scroll-reveal-scale block ${isVisible ? "visible" : ""}`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div
                  className={`w-14 h-14 ${cat.colorClass} rounded-2xl flex items-center justify-center mb-4 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm text-center mb-1 group-hover:text-brand-red transition-colors">
                  {cat.name}
                </h3>
                {cat.chazaCount != null && (
                  <p className="text-gray-400 text-xs text-center">{cat.chazaCount} chazas</p>
                )}
                <div className="absolute inset-0 rounded-2xl bg-brand-red/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </Link>
            )
          })}
        </div>

        <div className={`text-center mt-12 scroll-reveal-up stagger-3 ${isVisible ? "visible" : ""}`}>
          <p className="text-gray-400 text-sm mb-4">No encuentras lo que buscas?</p>
          <Link
            href={siteConfig.urls.publicarChaza}
            className="inline-flex items-center gap-2 font-stencil text-brand-red border-2 border-brand-red px-6 py-3 rounded-full hover:bg-brand-red hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg group"
          >
            <span>PUBLICAR MI CHAZA</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

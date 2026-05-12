"use client"

import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { 
  Coffee, 
  Printer, 
  Book, 
  Smartphone, 
  Scissors, 
  ShoppingBag,
  UtensilsCrossed,
  Palette,
  Dumbbell,
  Music,
  Camera,
  Bike
} from "lucide-react"

const categories = [
  {
    icon: Coffee,
    name: "Cafe y Bebidas",
    count: 12,
    color: "bg-amber-500",
  },
  {
    icon: UtensilsCrossed,
    name: "Comida",
    count: 18,
    color: "bg-orange-500",
  },
  {
    icon: Printer,
    name: "Papeleria",
    count: 8,
    color: "bg-blue-500",
  },
  {
    icon: Book,
    name: "Libros",
    count: 15,
    color: "bg-emerald-500",
  },
  {
    icon: Smartphone,
    name: "Tecnologia",
    count: 6,
    color: "bg-purple-500",
  },
  {
    icon: Scissors,
    name: "Belleza",
    count: 4,
    color: "bg-pink-500",
  },
  {
    icon: ShoppingBag,
    name: "Ropa y Accesorios",
    count: 9,
    color: "bg-rose-500",
  },
  {
    icon: Palette,
    name: "Arte y Manualidades",
    count: 7,
    color: "bg-indigo-500",
  },
  {
    icon: Dumbbell,
    name: "Deportes",
    count: 3,
    color: "bg-green-500",
  },
  {
    icon: Music,
    name: "Musica",
    count: 2,
    color: "bg-violet-500",
  },
  {
    icon: Camera,
    name: "Fotografia",
    count: 4,
    color: "bg-cyan-500",
  },
  {
    icon: Bike,
    name: "Transporte",
    count: 5,
    color: "bg-teal-500",
  },
]

export function CategoriesSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.1 })

  return (
    <section 
      ref={ref}
      id="categorias" 
      className="py-20 px-4 bg-gray-50"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className={`text-center mb-14 scroll-reveal-up ${isVisible ? "visible" : ""}`}>
          <span className="inline-block bg-brand-red/10 text-brand-red text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            Explora por categoria
          </span>
          <h2 className="font-stencil text-4xl sm:text-5xl text-brand-red mb-4 tracking-wide">
            TODAS LAS CATEGORIAS
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-base leading-relaxed">
            Encuentra exactamente lo que buscas. Desde cafe hasta servicios tecnologicos, tenemos de todo.
          </p>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat, index) => {
            const Icon = cat.icon
            return (
              <button
                key={cat.name}
                className={`group relative p-6 bg-white rounded-2xl border border-gray-100 hover:border-brand-red/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 scroll-reveal-scale ${isVisible ? "visible" : ""}`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {/* Icon container */}
                <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center mb-4 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                
                {/* Name */}
                <h3 className="font-semibold text-gray-800 text-sm text-center mb-1 group-hover:text-brand-red transition-colors">
                  {cat.name}
                </h3>
                
                {/* Count */}
                <p className="text-gray-400 text-xs text-center">
                  {cat.count} chazas
                </p>

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-brand-red/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </button>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className={`text-center mt-12 scroll-reveal-up stagger-3 ${isVisible ? "visible" : ""}`}>
          <p className="text-gray-400 text-sm mb-4">
            No encuentras lo que buscas?
          </p>
          <button className="inline-flex items-center gap-2 font-stencil text-brand-red border-2 border-brand-red px-6 py-3 rounded-full hover:bg-brand-red hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg group">
            <span>SUGERIR CATEGORIA</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </section>
  )
}

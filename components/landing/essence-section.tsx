"use client"

import { SquiggleIcon } from "./squiggle-icon"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

const essenceItems = [
  {
    title: "COMUNIDAD",
    description: "Conecta con estudiantes de toda la universidad en un solo lugar."
  },
  {
    title: "CONFIANZA",
    description: "Transacciones seguras entre miembros verificados de la UN."
  },
  {
    title: "ECONOMIA",
    description: "Precios justos y accesibles para estudiantes universitarios."
  },
  {
    title: "SOSTENIBLE",
    description: "Reutiliza, recicla y reduce el desperdicio en el campus."
  }
]

export function EssenceSection() {
  const { ref: sectionRef, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.2 })

  return (
    <section 
      ref={sectionRef}
      id="esencia" 
      className="py-12 sm:py-20 px-4 overflow-hidden"
    >
      <div className="mx-auto max-w-5xl">
        <div 
          className={`bg-gray-50 rounded-3xl shadow-xl p-8 sm:p-12 scroll-reveal-scale ${isVisible ? "visible" : ""}`}
        >
          {/* Section Title */}
          <div 
            className={`text-center mb-12 scroll-reveal-up stagger-1 ${isVisible ? "visible" : ""}`}
          >
            <h2 className="font-stencil text-3xl sm:text-4xl md:text-5xl text-brand-red mb-4 text-balance">
              NUESTRA ESENCIA
            </h2>
            <div className="flex justify-center">
              <SquiggleIcon width={100} height={30} className="text-brand-red opacity-60 animate-wave" />
            </div>
          </div>

          {/* Grid of essence items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {essenceItems.map((item, index) => (
              <div
                key={item.title}
                className={`
                  flex items-start gap-4 p-6 rounded-2xl 
                  bg-white/60 backdrop-blur-sm
                  border-2 border-brand-red/10
                  hover:border-brand-red/30 hover:shadow-lg
                  transition-all duration-500
                  hover-lift
                  scroll-reveal-up ${isVisible ? "visible" : ""}
                `}
                style={{ transitionDelay: `${0.15 + index * 0.1}s` }}
              >
                <div className="flex-shrink-0 mt-1 hover:scale-110 hover:rotate-6 transition-transform">
                  <SquiggleIcon 
                    width={40} 
                    height={20} 
                    className="text-brand-red" 
                  />
                </div>
                <div>
                  <h3 className="font-stencil text-xl sm:text-2xl text-brand-red mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

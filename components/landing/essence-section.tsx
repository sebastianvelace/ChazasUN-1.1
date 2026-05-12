"use client"

import { SquiggleIcon } from "./squiggle-icon"

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
    title: "ECONOMÍA",
    description: "Precios justos y accesibles para estudiantes universitarios."
  },
  {
    title: "SOSTENIBLE",
    description: "Reutiliza, recicla y reduce el desperdicio en el campus."
  }
]

export function EssenceSection() {
  return (
    <section id="esencia" className="py-12 sm:py-20 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="bg-gray-50 rounded-3xl shadow-xl p-8 sm:p-12">
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="font-stencil text-3xl sm:text-4xl md:text-5xl text-brand-red mb-4 text-balance">
              NUESTRA ESENCIA
            </h2>
            <div className="flex justify-center">
              <SquiggleIcon width={100} height={30} className="text-brand-red opacity-60" />
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
                  transition-all duration-300
                  opacity-0 animate-fade-in-up
                `}
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <div className="flex-shrink-0 mt-1">
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

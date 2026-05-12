"use client"

import { useScrollReveal } from "@/hooks/use-scroll-reveal"

const steps = [
  {
    number: "1",
    title: "REGISTRATE",
    description: "Crea tu cuenta con tu correo institucional @unal.edu.co y verifica tu identidad.",
    icon: (
      <svg viewBox="0 0 80 80" className="w-20 h-20" aria-hidden="true">
        {/* User with device icon */}
        <circle cx="40" cy="25" r="12" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M20,65 Q20,45 40,45 Q60,45 60,65" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <rect x="50" y="50" width="18" height="22" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="59" y1="68" x2="59" y2="68" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  },
  {
    number: "2",
    title: "PUBLICA",
    description: "Sube fotos, describe tu producto y establece un precio justo para tus companeros.",
    icon: (
      <svg viewBox="0 0 80 80" className="w-20 h-20" aria-hidden="true">
        {/* Tablet/posting icon */}
        <rect x="15" y="10" width="50" height="60" rx="4" fill="none" stroke="currentColor" strokeWidth="3" />
        <line x1="30" y1="25" x2="50" y2="25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="25" y1="35" x2="55" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="25" y1="45" x2="45" y2="45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="40" cy="60" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    )
  },
  {
    number: "3",
    title: "CONECTA",
    description: "Coordina con el comprador o vendedor y realiza el intercambio en el campus.",
    icon: (
      <svg viewBox="0 0 80 80" className="w-20 h-20" aria-hidden="true">
        {/* Two people connecting icon */}
        <circle cx="25" cy="25" r="10" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M10,55 Q10,40 25,40 Q35,40 38,48" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="55" cy="25" r="10" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M42,48 Q45,40 55,40 Q70,40 70,55" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        {/* Connection line */}
        <path d="M35,30 Q40,35 45,30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M36,50 L44,50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  }
]

export function HowItWorksSection() {
  const { ref: sectionRef, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.2 })

  return (
    <section 
      ref={sectionRef}
      id="como-funciona" 
      className="py-12 sm:py-20 px-4 overflow-hidden"
    >
      <div className="mx-auto max-w-6xl">
        <div 
          className={`bg-gray-50 rounded-3xl shadow-xl p-8 sm:p-12 scroll-reveal-scale ${isVisible ? "visible" : ""}`}
        >
          {/* Section Title */}
          <div 
            className={`text-center mb-12 sm:mb-16 scroll-reveal-up stagger-1 ${isVisible ? "visible" : ""}`}
          >
            <h2 className="font-stencil text-3xl sm:text-4xl md:text-5xl text-brand-red mb-4 text-balance">
              COMO FUNCIONA
            </h2>
            <p className="text-gray-600 text-lg max-w-xl mx-auto">
              Tres simples pasos para empezar a comprar y vender en tu universidad
            </p>
          </div>

          {/* Steps */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 md:gap-4 relative">
            {/* Connecting line for desktop */}
            <div 
              className={`hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-brand-red/20 scroll-reveal ${isVisible ? "visible" : ""}`}
              style={{ transitionDelay: "0.5s" }}
              aria-hidden="true"
            >
              <div 
                className="h-full bg-brand-red transition-all duration-1000 ease-out"
                style={{ width: isVisible ? "100%" : "0%" }}
              />
            </div>

            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`
                  flex-1 flex flex-col items-center text-center relative
                  scroll-reveal-up ${isVisible ? "visible" : ""}
                `}
                style={{ transitionDelay: `${0.2 + index * 0.2}s` }}
              >
                {/* Step number */}
                <div className="relative mb-6 group">
                  <span className="font-stencil text-7xl sm:text-8xl text-brand-red/20 group-hover:text-brand-red/30 transition-colors duration-500">
                    {step.number}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center text-brand-red group-hover:scale-110 transition-transform duration-500">
                    {step.icon}
                  </div>
                </div>

                {/* Step content */}
                <h3 className="font-stencil text-xl sm:text-2xl text-brand-red mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-xs">
                  {step.description}
                </p>

                {/* Mobile arrow (not on last item) */}
                {index < steps.length - 1 && (
                  <div className="md:hidden my-4 text-brand-red/40">
                    <svg width="24" height="24" viewBox="0 0 24 24" className="rotate-90">
                      <path d="M5 12h14M12 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

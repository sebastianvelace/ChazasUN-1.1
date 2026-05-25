"use client"

import { useScrollReveal } from "@/hooks/use-scroll-reveal"

const steps = [
  {
    number: "01",
    title: "REGISTRATE",
    description: "Crea tu cuenta en segundos. Sin carnet, sin datos sensibles — solo un correo.",
    icon: (
      <svg viewBox="0 0 64 64" className="w-14 h-14" aria-hidden="true">
        <circle cx="32" cy="20" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M14,54 Q14,38 32,38 Q50,38 50,54" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="48" cy="48" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M44,48 L47,51 L52,45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "EXPLORA",
    description: "Desliza tarjetas de chazas como si fueran flashcards. Da like a las que te interesan.",
    icon: (
      <svg viewBox="0 0 64 64" className="w-14 h-14" aria-hidden="true">
        <rect x="14" y="10" width="36" height="44" rx="6" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <path d="M22,22 L42,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M22,30 L38,30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M22,38 L34,38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M38,46 L46,54 M46,46 L38,54" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M40,34 L52,34 M46,28 L52,34 L46,40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "CONECTA",
    description: "Contacta al vendedor y coordina el intercambio en el campus. Rápido y sin complicaciones.",
    icon: (
      <svg viewBox="0 0 64 64" className="w-14 h-14" aria-hidden="true">
        <circle cx="20" cy="22" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <path d="M8,48 Q8,36 20,36 Q28,36 31,42" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="44" cy="22" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <path d="M33,42 Q36,36 44,36 Q56,36 56,48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M28,26 Q32,30 36,26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
]

export function HowItWorksSection() {
  const { ref: sectionRef, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.15 })

  return (
    <section
      ref={sectionRef}
      id="como-funciona"
      className="relative py-20 sm:py-28 px-4 bg-brand-red overflow-hidden"
    >
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,0.4) 39px,rgba(255,255,255,0.4) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,0.4) 39px,rgba(255,255,255,0.4) 40px)",
        }}
        aria-hidden="true"
      />
      {/* Floating blobs */}
      <div className="absolute top-16 right-16 w-56 h-56 bg-white/5 rounded-full blur-3xl animate-float" aria-hidden="true" />
      <div className="absolute bottom-16 left-12 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className={`text-center mb-16 sm:mb-20 scroll-reveal-up ${isVisible ? "visible" : ""}`}>
          <span className="inline-block bg-white/20 text-white text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            Simple y directo
          </span>
          <h2 className="font-stencil text-5xl sm:text-6xl md:text-7xl text-white leading-none mb-4">
            COMO FUNCIONA
          </h2>
          <p className="text-white/60 text-lg max-w-md mx-auto">
            Tres pasos para comprar y vender en tu universidad
          </p>
        </div>

        {/* Steps grid — gap-px trick: the white/15 bg shows as thin dividers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/15 rounded-3xl overflow-hidden">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`relative p-10 sm:p-12 bg-brand-red hover:bg-white/5 transition-colors duration-500 group scroll-reveal-up ${isVisible ? "visible" : ""}`}
              style={{ transitionDelay: `${0.2 + i * 0.15}s` }}
            >
              {/* Decorative number */}
              <p className="font-stencil text-[9rem] leading-none text-white/8 absolute -top-2 -left-1 select-none pointer-events-none">
                {step.number}
              </p>

              {/* Icon */}
              <div className="relative z-10 text-white/50 group-hover:text-white/80 transition-colors duration-500 mb-7">
                {step.icon}
              </div>

              {/* Title */}
              <h3 className="relative z-10 font-stencil text-2xl sm:text-3xl text-white mb-3 tracking-wide">
                {step.title}
              </h3>

              {/* Description */}
              <p className="relative z-10 text-white/55 text-base leading-relaxed group-hover:text-white/75 transition-colors duration-500">
                {step.description}
              </p>

              {/* Mobile separator arrow */}
              {i < steps.length - 1 && (
                <div className="md:hidden mt-8 text-white/20" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

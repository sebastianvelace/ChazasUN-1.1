"use client"

import Link from "next/link"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { siteConfig } from "@/config/site"

const steps = [
  {
    number: "01",
    title: "REGISTRATE",
    description: "Crea tu cuenta en segundos. Sin carnet, sin datos sensibles — solo un correo.",
    cta: null,
    icon: (
      <svg viewBox="0 0 64 64" className="w-12 h-12" aria-hidden="true">
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
    description: "Desliza chazas como flashcards. Dale like a las que te interesan y guarda tus favoritas.",
    cta: null,
    icon: (
      <svg viewBox="0 0 64 64" className="w-12 h-12" aria-hidden="true">
        <rect x="14" y="10" width="36" height="44" rx="6" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <path d="M22,22 L42,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M22,30 L38,30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M22,38 L34,38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M40,34 L52,34 M46,28 L52,34 L46,40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "CONECTA",
    description: "Contacta al vendedor directo por WhatsApp o Instagram. Rápido, sin intermediarios.",
    cta: { label: "Explorar ahora →", href: siteConfig.urls.explorar },
    icon: (
      <svg viewBox="0 0 64 64" className="w-12 h-12" aria-hidden="true">
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
  const { ref: sectionRef, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.1 })

  return (
    <section
      ref={sectionRef}
      id="como-funciona"
      className="relative py-20 sm:py-28 px-4 bg-brand-red overflow-hidden"
    >
      {/* Textura grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,0.6) 39px,rgba(255,255,255,0.6) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,0.6) 39px,rgba(255,255,255,0.6) 40px)",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_30%,rgba(255,255,255,0.05)_0%,transparent_70%)]" aria-hidden="true" />
      <div className="absolute top-16 right-16 w-56 h-56 bg-white/5 rounded-full blur-3xl animate-float" aria-hidden="true" />
      <div className="absolute bottom-16 left-12 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-6xl">

        {/* Header */}
        <div className={`text-center mb-14 sm:mb-18 scroll-reveal-up ${isVisible ? "visible" : ""}`}>
          <span className="inline-flex items-center gap-2 glass text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            Simple y directo
          </span>
          <h2 className="font-stencil text-5xl sm:text-6xl md:text-7xl text-white leading-none mb-4">
            COMO FUNCIONA
          </h2>
          {/* Zeigarnik: subtítulo que implica tarea incompleta */}
          <p className="text-white/55 text-base sm:text-lg max-w-sm mx-auto font-medium">
            3 pasos · menos de 2 minutos · gratis
          </p>
        </div>

        {/* Steps — Gestalt: continuidad con conectores */}
        <div className="relative">

          {/* Conector horizontal (desktop) — Gestalt ley de continuidad */}
          <div
            className="hidden md:block absolute top-[52px] left-[calc(16.66%+32px)] right-[calc(16.66%+32px)] h-px"
            aria-hidden="true"
          >
            <div
              className={`h-full bg-gradient-to-r from-white/20 via-white/40 to-white/20 transition-all duration-1000 ${isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`}
              style={{ transformOrigin: "left", transitionDelay: "0.6s" }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className={`group relative scroll-reveal-up ${isVisible ? "visible" : ""}`}
                style={{ transitionDelay: `${0.15 + i * 0.15}s` }}
              >
                {/* Card glassmorfismo — Jakob's Law: tarjeta reconocible */}
                <div className="glass rounded-3xl p-8 sm:p-10 h-full hover:bg-white/20 transition-all duration-500 border-white/15 group-hover:border-white/30 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-black/20">

                  {/* Número del paso — Zeigarnik: secuencia visible */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <span className="font-stencil text-sm text-white/80">{step.number}</span>
                    </div>
                    {/* Conector hacia siguiente paso en mobile */}
                    {i < steps.length - 1 && (
                      <div className="md:hidden flex-1 h-px bg-gradient-to-r from-white/25 to-transparent" aria-hidden="true" />
                    )}
                  </div>

                  {/* Icono */}
                  <div className="text-white/55 group-hover:text-white/90 transition-colors duration-300 mb-6">
                    {step.icon}
                  </div>

                  {/* Título */}
                  <h3 className="font-stencil text-2xl sm:text-3xl text-white mb-3 tracking-wide">
                    {step.title}
                  </h3>

                  {/* Descripción — Plus Jakarta Sans */}
                  <p className="text-white/55 text-sm sm:text-base leading-relaxed group-hover:text-white/75 transition-colors duration-300 font-medium">
                    {step.description}
                  </p>

                  {/* CTA en último paso — Zeigarnik + Fitts */}
                  {step.cta && (
                    <Link
                      href={step.cta.href}
                      className="inline-flex items-center gap-1.5 mt-6 text-sm font-bold text-white/80 hover:text-white transition-colors group/link"
                    >
                      <span>{step.cta.label}</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zeigarnik footer: progreso de la acción */}
        <div className={`mt-12 text-center scroll-reveal-up ${isVisible ? "visible" : ""}`} style={{ transitionDelay: "0.6s" }}>
          <p className="text-white/35 text-xs font-semibold uppercase tracking-widest">
            ¿Tienes una chaza? Publícala en menos de 3 minutos →
          </p>
        </div>
      </div>
    </section>
  )
}

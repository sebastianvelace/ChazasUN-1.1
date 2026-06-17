"use client"

import Link from "next/link"
import { useGSAPSafe } from "@/hooks/use-gsap-reduced"
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
  const sectionRef = useGSAPSafe(({ isReduced, gsap, ScrollTrigger }) => {
    if (isReduced) return

    // Header fade + clip-path reveal for the title
    ScrollTrigger.batch(".hiw-header", {
      onEnter: (els) => gsap.fromTo(els,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" }
      ),
      once: true,
      start: "top bottom",
    })

    ScrollTrigger.batch(".hiw-title", {
      onEnter: (els) => gsap.fromTo(els,
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", duration: 0.85, ease: "power2.inOut", delay: 0.1 }
      ),
      once: true,
      start: "top bottom",
    })

    // Connector line draws progressively as user scrolls
    gsap.from("#connector-line", {
      scaleX: 0,
      transformOrigin: "left center",
      ease: "none",
      scrollTrigger: {
        trigger: ".hiw-steps-container",
        start: "top 75%",
        end: "center center",
        scrub: 1,
      },
    })

    // Ghost numbers parallax — each moves at a different rate
    gsap.utils.toArray<HTMLElement>(".hiw-ghost-number").forEach((el) => {
      gsap.to(el, {
        y: -50,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 2,
        },
      })
    })

    // Step cards slide in from sides with opacity
    const stepEls = gsap.utils.toArray<HTMLElement>(".hiw-step")
    stepEls.forEach((el, i) => {
      const xFrom = i === 0 ? -36 : i === 2 ? 36 : 0
      ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        once: true,
        onEnter() {
          gsap.fromTo(el,
            { opacity: 0, y: 36, x: xFrom, scale: 0.97 },
            { opacity: 1, y: 0, x: 0, scale: 1, duration: 0.65, ease: "expo.out" }
          )
        },
      })
    })
  })

  return (
    <section
      ref={sectionRef}
      id="como-funciona"
      className="relative py-16 sm:py-24 px-4 bg-muted border-t border-border overflow-hidden"
    >
      <div className="relative z-10 mx-auto max-w-6xl">

        {/* Header */}
        <div className="hiw-header text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-brand-red" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-red">Simple y directo</span>
            <div className="h-px w-8 bg-brand-red" />
          </div>
          <h2 className="hiw-title font-display font-black text-foreground leading-none tracking-tight" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
            CÓMO FUNCIONA
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-lg mx-auto">
            Tres pasos para conectar con tu comunidad universitaria.
          </p>
        </div>

        <div className="relative">
          <div
            className="hidden md:block absolute top-[52px] left-[calc(16.66%+32px)] right-[calc(16.66%+32px)] h-px"
            aria-hidden="true"
          >
            <div id="connector-line" className="h-full bg-border" />
          </div>

          <div className="hiw-steps-container grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className="hiw-step group relative overflow-hidden rounded-2xl border border-border bg-background p-8 shadow-sm hover:shadow-md hover:border-gray-200 transition-all"
              >
                <div className="h-full flex flex-col">
                  <div className="mb-6 flex items-center gap-4">
                    <span className="hiw-ghost-number font-display font-black text-[7rem] leading-none text-muted/30 select-none absolute -top-4 -left-2 transition-colors group-hover:text-brand-red/10">
                      {step.number}
                    </span>
                    <div className="relative z-10 w-10 h-10 rounded-full border-2 border-brand-red flex items-center justify-center text-brand-red font-bold font-display">
                      {step.number}
                    </div>
                    {i < steps.length - 1 && (
                      <div className="md:hidden flex-1 h-px bg-gradient-to-r from-border to-transparent" aria-hidden="true" />
                    )}
                  </div>

                  <div className="text-muted-foreground group-hover:text-brand-red transition-colors duration-300 mb-6">
                    {step.icon}
                  </div>

                  <h3 className="font-display font-bold text-foreground text-xl mb-3">
                    {step.title}
                  </h3>

                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                    {step.description}
                  </p>

                  {step.cta && (
                    <Link
                      href={step.cta.href}
                      className="inline-flex items-center gap-1.5 mt-6 text-sm font-bold text-brand-red hover:text-brand-red-dark transition-colors"
                    >
                      <span>{step.cta.label}</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">
            ¿Tienes una chaza? Publícala en menos de 3 minutos →
          </p>
        </div>
      </div>
    </section>
  )
}

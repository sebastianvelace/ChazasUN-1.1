"use client"

import Link from "next/link"
import { Heart, MapPinned, MessageCircle } from "lucide-react"
import { useGSAPSafe } from "@/hooks/use-gsap-reduced"
import { siteConfig } from "@/config/site"

const steps = [
  {
    number: "01",
    title: "DESCUBRE",
    description: "Explora puestos, productos y servicios del campus sin crear una cuenta.",
    cta: null,
    icon: MapPinned,
  },
  {
    number: "02",
    title: "DECIDE",
    description: "Compara fotos, precios y ubicación. Guarda o recomienda cuando quieras volver.",
    cta: null,
    icon: Heart,
  },
  {
    number: "03",
    title: "CONTACTA",
    description: "Escribe directamente por WhatsApp o Instagram, sin comisiones ni intermediarios.",
    cta: { label: "Explorar ahora", href: siteConfig.urls.explorar },
    icon: MessageCircle,
  },
]

export function HowItWorksSection() {
  const sectionRef = useGSAPSafe(({ isReduced, gsap, ScrollTrigger }) => {
    if (isReduced) return

    // Header fade + clip-path reveal for the title.
    // Uses direct scrollTriggers (not batch) — batch could leave the title
    // stuck at clipPath inset(0 100% 0 0) (fully clipped = invisible H2) when
    // trigger positions were stale on first paint.
    gsap.fromTo(".hiw-header",
      { opacity: 0, y: 28 },
      {
        opacity: 1, y: 0, duration: 0.6, ease: "expo.out",
        scrollTrigger: { trigger: ".hiw-header", start: "top 88%", once: true },
      }
    )

    gsap.fromTo(".hiw-title",
      { clipPath: "inset(0 100% 0 0)" },
      {
        clipPath: "inset(0 0% 0 0)", duration: 0.85, ease: "power2.inOut", delay: 0.1,
        scrollTrigger: { trigger: ".hiw-header", start: "top 88%", once: true },
      }
    )

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
            {steps.map((step, i) => {
              const StepIcon = step.icon

              return (
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
                      <StepIcon className="h-12 w-12" strokeWidth={1.6} aria-hidden="true" />
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
                        <span aria-hidden="true">→</span>
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href={siteConfig.urls.publicarChaza}
            className="inline-flex items-center gap-2 text-sm font-bold text-foreground underline decoration-brand-red decoration-2 underline-offset-4 transition-colors hover:text-brand-red"
          >
            ¿Vendes en el campus? Publica tu chaza
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

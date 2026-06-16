"use client"

import { useGSAPSafe } from "@/hooks/use-gsap-reduced"
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
    title: "ECONOMIA",
    description: "Precios justos y accesibles para estudiantes universitarios."
  },
  {
    title: "SOSTENIBLE",
    description: "Reutiliza, recicla y reduce el desperdicio en el campus."
  }
]

export function EssenceSection() {
  const sectionRef = useGSAPSafe(({ isReduced, gsap, ScrollTrigger }) => {
    if (isReduced) return

    gsap.from(".essence-header", {
      y: 24,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".essence-header",
        start: "top bottom",
        once: true,
      },
    })

    gsap.from(".essence-card", {
      y: 32,
      scale: 0.97,
      duration: 0.55,
      stagger: {
        amount: 0.35,
        grid: [2, 2],
        from: "start",
      },
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom",
        once: true,
      },
    })
  })

  return (
    <section ref={sectionRef} id="esencia" className="py-12 sm:py-20 px-4 overflow-hidden bg-background">
      <div className="mx-auto max-w-5xl">
        <div className="bg-muted rounded-3xl p-8 sm:p-12">
          <div className="essence-header text-center mb-12">
            <h2 className="font-display font-extrabold text-5xl md:text-6xl text-foreground tracking-tight mb-4 text-balance">
              NUESTRA ESENCIA
            </h2>
            <div className="flex justify-center">
              <SquiggleIcon width={100} height={30} className="text-brand-red opacity-60 animate-wave" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {essenceItems.map((item) => (
              <div
                key={item.title}
                className="essence-card flex items-start gap-4 p-6 rounded-2xl bg-background border border-border shadow-sm hover:border-brand-red/20 hover:shadow-md transition-all duration-300"
              >
                <div className="flex-shrink-0 mt-1 hover:scale-110 hover:rotate-6 transition-transform">
                  <SquiggleIcon width={40} height={20} className="text-brand-red" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
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

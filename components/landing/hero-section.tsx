"use client"

import { useEffect, useState } from "react"
import { Store, Users, Zap, ArrowDown } from "lucide-react"

const stats = [
  { value: "+50", label: "Chazas activas" },
  { value: "+2k", label: "Estudiantes" },
  { value: "4.8", label: "Valoracion promedio" },
]

const features = [
  {
    icon: Store,
    title: "+50 Chazas",
    description: "Comida, servicios, libros y mas en un solo lugar.",
  },
  {
    icon: Users,
    title: "Comunidad UN",
    description: "Apoya emprendedores estudiantes de tu universidad.",
  },
  {
    icon: Zap,
    title: "Rapido y facil",
    description: "Desliza, descubre y contacta en segundos.",
  },
]

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section id="inicio" className="relative bg-brand-red overflow-hidden">
      {/* Animated grid texture overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,0.4) 39px,rgba(255,255,255,0.4) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,0.4) 39px,rgba(255,255,255,0.4) 40px)",
        }}
        aria-hidden="true"
      />

      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-3xl animate-float" aria-hidden="true" />
      <div className="absolute bottom-40 right-20 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} aria-hidden="true" />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse-soft" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-20 pb-0">
        <div className="flex flex-col lg:flex-row items-start gap-16">

          {/* Left: copy */}
          <div className="flex-1 py-12 lg:py-20">
            {/* Badge */}
            <span 
              className={`inline-block bg-white/20 text-white text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-8 transition-all duration-700 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              Marketplace universitario
            </span>

            {/* Headline */}
            <h1 
              className={`font-stencil text-6xl sm:text-7xl lg:text-8xl text-white leading-none mb-6 transition-all duration-700 delay-100 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              CHAZAS<br />
              <span className="text-white/60 inline-block animate-pulse-soft" style={{ animationDuration: "3s" }}>UN</span>
            </h1>

            {/* Description */}
            <p 
              className={`text-white/90 text-lg sm:text-xl leading-relaxed mb-4 max-w-lg font-sans transition-all duration-700 delay-200 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              El marketplace de los estudiantes de la{" "}
              <strong className="text-white font-semibold">Universidad Nacional</strong>.
              Descubre las mejores chazas del campus: comida, servicios, libros y mucho mas.
            </p>
            <p 
              className={`text-white/70 text-base leading-relaxed mb-10 max-w-lg font-sans transition-all duration-700 delay-300 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              Conecta con emprendedores de tu propia comunidad universitaria y encuentra todo lo que necesitas sin salir de la U.
            </p>

            {/* CTAs */}
            <div 
              className={`flex flex-col sm:flex-row gap-3 mb-14 transition-all duration-700 delay-400 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <a
                href="#explorar"
                className="font-stencil text-lg bg-white text-brand-red px-8 py-4 rounded-2xl hover:bg-gray-100 transition-all transform hover:scale-105 hover:shadow-2xl shadow-xl text-center tracking-wide hover-lift"
              >
                EXPLORAR CHAZAS
              </a>
              <a
                href="#registro"
                className="font-stencil text-lg border-2 border-white/50 text-white px-8 py-4 rounded-2xl hover:bg-white/10 hover:border-white transition-all text-center tracking-wide"
              >
                REGISTRAR MI CHAZA
              </a>
            </div>

            {/* Stats row */}
            <div 
              className={`flex items-center gap-8 border-t border-white/20 pt-8 transition-all duration-700 delay-500 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              {stats.map((s, i) => (
                <div 
                  key={s.label} 
                  className="group cursor-default"
                  style={{ transitionDelay: `${600 + i * 100}ms` }}
                >
                  <p className="font-stencil text-2xl text-white group-hover:scale-110 transition-transform">{s.value}</p>
                  <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: feature cards – white panel */}
          <div 
            className={`lg:flex-none lg:w-80 xl:w-96 w-full transition-all duration-1000 delay-300 ${
              mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
            }`}
          >
            {/* White angled panel */}
            <div className="bg-white rounded-tl-3xl rounded-tr-3xl p-8 pt-12 pb-16 h-full shadow-2xl hover-glow">
              <p className="font-stencil text-brand-red text-xs tracking-widest uppercase mb-8 opacity-60">
                Por que elegir ChazasUN
              </p>
              <div className="flex flex-col gap-7">
                {features.map(({ icon: Icon, title, description }, i) => (
                  <div 
                    key={title} 
                    className={`flex items-start gap-4 transition-all duration-500 ${
                      mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
                    style={{ transitionDelay: `${500 + i * 150}ms` }}
                  >
                    <div className="w-11 h-11 rounded-xl bg-brand-red/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-red/20 transition-colors hover:scale-110 hover:rotate-3 transition-transform">
                      <Icon className="w-5 h-5 text-brand-red" />
                    </div>
                    <div>
                      <h3 className="font-stencil text-lg text-brand-red mb-1 tracking-wide">
                        {title}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Scroll hint */}
              <div className="mt-10 flex items-center gap-2 text-gray-400 text-xs">
                <ArrowDown className="w-4 h-4 animate-bounce" />
                <span>Desliza para explorar chazas</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom wave that transitions into white */}
      <div className="relative h-16 bg-brand-red">
        <svg
          viewBox="0 0 1440 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute bottom-0 w-full"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 64 L0 32 Q360 0 720 32 Q1080 64 1440 32 L1440 64 Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  )
}

"use client"

import { SquiggleIcon } from "./squiggle-icon"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

export function Footer() {
  const { ref: footerRef, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.2 })

  return (
    <footer 
      ref={footerRef}
      id="contacto" 
      className="bg-brand-red w-full overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-16 sm:py-24 flex flex-col items-center relative">
          {/* Floating decorative elements */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-3xl animate-float" aria-hidden="true" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} aria-hidden="true" />

          {/* Decorative squiggle */}
          <div className={`scroll-reveal-up ${isVisible ? "visible" : ""}`}>
            <SquiggleIcon 
              width={80} 
              height={40} 
              className="text-white/40 mb-6 animate-wave" 
            />
          </div>
          
          {/* Brand name */}
          <h2 
            className={`font-stencil text-4xl sm:text-5xl md:text-7xl text-white text-center mb-6 scroll-reveal-up stagger-1 ${isVisible ? "visible" : ""}`}
          >
            CHAZAS UN
          </h2>
          
          {/* Tagline */}
          <p 
            className={`text-white/80 text-center text-lg max-w-md mb-8 scroll-reveal-up stagger-2 ${isVisible ? "visible" : ""}`}
          >
            El marketplace de los estudiantes de la Universidad Nacional
          </p>

          {/* Social/Contact Links */}
          <div 
            className={`flex items-center gap-6 mb-8 scroll-reveal-up stagger-3 ${isVisible ? "visible" : ""}`}
          >
            <a 
              href="mailto:contacto@chazasun.com" 
              className="text-white/70 hover:text-white transition-all text-sm hover:scale-105"
            >
              contacto@chazasun.com
            </a>
            <span className="text-white/30">|</span>
            <a 
              href="#" 
              className="text-white/70 hover:text-white transition-all text-sm hover:scale-105"
            >
              Instagram
            </a>
          </div>

          {/* CTA */}
          <a
            href="#registro"
            className={`font-stencil text-base bg-white text-brand-red px-8 py-3 rounded-full hover:bg-gray-100 transition-all hover:scale-105 hover:shadow-xl scroll-reveal-scale stagger-4 ${isVisible ? "visible" : ""}`}
          >
            ¡UNETE AHORA!
          </a>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/20 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-white/60 text-sm">
            <p>
              2024 ChazasUN. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors">
                Terminos
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Privacidad
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

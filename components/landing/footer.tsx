"use client"

import Link from "next/link"
import { SquiggleIcon } from "./squiggle-icon"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { Instagram, Twitter, Facebook } from "lucide-react"

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

          {/* Social Links */}
          <div 
            className={`flex items-center gap-4 mb-8 scroll-reveal-up stagger-3 ${isVisible ? "visible" : ""}`}
          >
            <a 
              href="#" 
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a 
              href="#" 
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a 
              href="#" 
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
          </div>

          {/* Description */}
          <p className={`text-white/60 text-center text-sm max-w-sm mb-8 scroll-reveal-up stagger-4 ${isVisible ? "visible" : ""}`}>
            Proyecto creado por estudiantes para estudiantes. No es un proyecto oficial de la universidad.
          </p>

          {/* CTA */}
          <a
            href="#explorar"
            className={`font-stencil text-base bg-white text-brand-red px-8 py-3 rounded-full hover:bg-gray-100 transition-all hover:scale-105 hover:shadow-xl scroll-reveal-scale stagger-5 ${isVisible ? "visible" : ""}`}
          >
            EXPLORAR CHAZAS
          </a>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/20 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-white/60 text-sm">
            <p>
              2024 ChazasUN. Proyecto estudiantil independiente.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/terminos" className="hover:text-white transition-colors hover:scale-105">
                Terminos
              </Link>
              <Link href="/privacidad" className="hover:text-white transition-colors hover:scale-105">
                Privacidad
              </Link>
              <a href="#contacto" className="hover:text-white transition-colors hover:scale-105">
                Contacto
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

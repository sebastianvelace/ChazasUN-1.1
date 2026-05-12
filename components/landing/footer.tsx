"use client"

import { SquiggleIcon } from "./squiggle-icon"

export function Footer() {
  return (
    <footer id="contacto" className="bg-brand-red w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-16 sm:py-24 flex flex-col items-center">
          {/* Decorative squiggle */}
          <SquiggleIcon 
            width={80} 
            height={40} 
            className="text-white/40 mb-6" 
          />
          
          {/* Brand name */}
          <h2 className="font-stencil text-4xl sm:text-5xl md:text-7xl text-white text-center mb-6">
            CHAZAS UN
          </h2>
          
          {/* Tagline */}
          <p className="text-white/80 text-center text-lg max-w-md mb-8">
            El marketplace de los estudiantes de la Universidad Nacional
          </p>

          {/* Social/Contact Links */}
          <div className="flex items-center gap-6 mb-8">
            <a 
              href="mailto:contacto@chazasun.com" 
              className="text-white/70 hover:text-white transition-colors text-sm"
            >
              contacto@chazasun.com
            </a>
            <span className="text-white/30">|</span>
            <a 
              href="#" 
              className="text-white/70 hover:text-white transition-colors text-sm"
            >
              Instagram
            </a>
          </div>

          {/* CTA */}
          <a
            href="#registro"
            className="font-stencil text-base bg-white text-brand-red px-8 py-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            ¡ÚNETE AHORA!
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
                Términos
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

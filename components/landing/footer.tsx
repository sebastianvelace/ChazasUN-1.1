"use client"

import Link from "next/link"
import { SquiggleIcon } from "./squiggle-icon"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { siteConfig } from "@/config/site"

export function Footer() {
  const { ref: footerRef, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.15 })

  return (
    <footer
      ref={footerRef}
      id="contacto"
      className="bg-brand-red w-full overflow-hidden"
    >
      {/* Wave entrada */}
      <div className="relative h-12 bg-white">
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 w-full" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 0 Q360 48 720 24 Q1080 0 1440 48 L1440 48 L0 48 Z" fill="#A31E1E" />
        </svg>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Main footer */}
        <div className="pt-16 pb-12 relative">
          <div className="absolute top-10 left-0 w-40 h-40 bg-white/4 rounded-full blur-3xl animate-float" aria-hidden="true" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/4 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} aria-hidden="true" />

          {/* Layout Gestalt: agrupado en 2 columnas en desktop */}
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Izquierda: Marca */}
            <div className={`scroll-reveal-up ${isVisible ? "visible" : ""}`}>
              <div className="flex items-center gap-3 mb-5">
                <SquiggleIcon width={48} height={24} className="text-white/50 animate-wave" />
                <span className="font-stencil text-3xl text-white tracking-wider">CHAZAS UN</span>
              </div>
              <p className="text-white/65 text-base leading-relaxed max-w-xs font-medium mb-8">
                El marketplace de los estudiantes de la Universidad Nacional de Colombia.
                Gratuito para todos.
              </p>

              {/* CTA footer — Fitts: botón grande, glassmorfismo */}
              <Link
                href={siteConfig.urls.explorar}
                className="inline-flex items-center gap-2 font-stencil text-base bg-white text-brand-red px-8 py-3.5 rounded-2xl
                           hover:bg-gray-50 transition-all duration-300 hover:shadow-xl hover:shadow-black/15
                           hover:-translate-y-0.5 active:scale-[0.97] shadow-lg shadow-black/10"
              >
                EXPLORAR CHAZAS
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            {/* Derecha: Links — Hick's Law: 3 grupos máximo */}
            <div className={`scroll-reveal-up stagger-2 ${isVisible ? "visible" : ""} grid grid-cols-2 gap-8`}>
              <div>
                <p className="text-white/30 text-xs font-bold uppercase tracking-[0.15em] mb-4">Plataforma</p>
                <nav className="flex flex-col gap-3">
                  <Link href={siteConfig.urls.explorar} className="text-white/65 hover:text-white text-sm font-semibold transition-colors">Explorar chazas</Link>
                  <Link href={siteConfig.urls.mapa} className="text-white/65 hover:text-white text-sm font-semibold transition-colors">Mapa del campus</Link>
                  <Link href={siteConfig.urls.publicarChaza} className="text-white/65 hover:text-white text-sm font-semibold transition-colors">Publicar mi chaza</Link>
                </nav>
              </div>
              <div>
                <p className="text-white/30 text-xs font-bold uppercase tracking-[0.15em] mb-4">Legal</p>
                <nav className="flex flex-col gap-3">
                  <Link href="/terminos" className="text-white/65 hover:text-white text-sm font-semibold transition-colors">Términos de uso</Link>
                  <Link href="/privacidad" className="text-white/65 hover:text-white text-sm font-semibold transition-colors">Privacidad</Link>
                  <Link href={siteConfig.urls.blog} className="text-white/65 hover:text-white text-sm font-semibold transition-colors">Blog</Link>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/15 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-white/40 text-xs font-medium">
            <p>© 2026 ChazasUN — Proyecto estudiantil independiente · UN Bogotá</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

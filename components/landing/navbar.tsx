"use client"

import { useState } from "react"
import Link from "next/link"
import { SquiggleIcon } from "./squiggle-icon"
import { Menu, X } from "lucide-react"
import { siteConfig } from "@/config/site"
import { useScrolled } from "@/hooks/use-scrolled"
import { cn } from "@/lib/utils"

/* Hick's Law: solo 3 enlaces visibles + 1 CTA. Menos opciones = decisión más rápida */
const navLinks = [
  { href: siteConfig.urls.explorar, label: "Explorar", isRoute: true },
  { href: siteConfig.urls.mapa,     label: "Mapa",     isRoute: true },
  { href: siteConfig.urls.blog,     label: "Blog",     isRoute: true },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const scrolled = useScrolled()

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "glass-nav" : "bg-white/95 backdrop-blur-sm shadow-sm border-b border-brand-red/5"
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo — Jakob's Law: logo izquierda, destino home */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <SquiggleIcon
              width={36}
              height={18}
              className="text-brand-red transition-transform duration-300 group-hover:scale-110"
            />
            <span className="font-stencil text-xl sm:text-2xl text-brand-red tracking-wider">
              CHAZAS UN
            </span>
          </Link>

          {/* Desktop: 3 links (Hick) + CTA grande (Fitts) */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-brand-red/80 hover:text-brand-red transition-colors duration-200 link-underline"
              >
                {link.label}
              </Link>
            ))}

            {/* Fitts: CTA más grande y llamativo */}
            <Link
              href={siteConfig.urls.publicarChaza}
              className="btn-red-shimmer font-stencil text-sm bg-brand-red text-white px-6 py-2.5 rounded-xl
                         hover:bg-brand-red-dark transition-colors duration-300 active:scale-[0.97]
                         shadow-md shadow-brand-red/20 hover:shadow-lg hover:shadow-brand-red/30
                         hover:-translate-y-0.5"
            >
              PUBLICAR CHAZA
            </Link>
          </div>

          {/* Fitts: botón hamburguesa más grande en mobile */}
          <button
            type="button"
            className="md:hidden p-3 -mr-1 text-brand-red transition-opacity hover:opacity-70 rounded-xl hover:bg-brand-red/5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Cerrar menu" : "Abrir menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu — Gestalt proximidad: items agrupados */}
        {mobileMenuOpen && (
          <div className="md:hidden py-5 border-t border-brand-red/10 flex flex-col gap-1 animate-menu-in">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-brand-red font-semibold px-3 py-3 rounded-xl hover:bg-brand-red/5 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 mt-2 border-t border-brand-red/10">
              <Link
                href={siteConfig.urls.publicarChaza}
                className="font-stencil text-sm bg-brand-red text-white px-5 py-3 rounded-xl text-center
                           transition-colors hover:bg-brand-red-dark block"
                onClick={() => setMobileMenuOpen(false)}
              >
                PUBLICAR CHAZA
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

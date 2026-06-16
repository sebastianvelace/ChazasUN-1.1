"use client"

import { useState } from "react"
import Link from "next/link"
import { SquiggleIcon } from "./squiggle-icon"
import { Menu, X } from "lucide-react"
import { siteConfig } from "@/config/site"
import { useScrolled } from "@/hooks/use-scrolled"
import { cn } from "@/lib/utils"
import { useMagnetic } from "@/hooks/use-magnetic"

/* Hick's Law: solo 3 enlaces visibles + 1 CTA. Menos opciones = decisión más rápida */
const navLinks = [
  { href: siteConfig.urls.explorar, label: "Explorar", isRoute: true },
  { href: siteConfig.urls.mapa,     label: "Mapa",     isRoute: true },
  { href: siteConfig.urls.blog,     label: "Blog",     isRoute: true },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const scrolled = useScrolled()
  const magneticCTA = useMagnetic({ strength: 0.35 })

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-transparent"
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
            <span className="font-display font-black text-base tracking-[0.06em] text-foreground">
              CHAZAS UN
            </span>
          </Link>

          {/* Desktop: 3 links (Hick) + CTA grande (Fitts) */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground transition hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}

            <span ref={magneticCTA} style={{ display: 'inline-block' }}>
              <Link
                href={siteConfig.urls.publicarChaza}
                className="rounded-full bg-brand-red px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground transition hover:bg-foreground active:scale-95"
              >
                PUBLICAR CHAZA
              </Link>
            </span>
          </div>

          <button
            type="button"
            className="md:hidden p-3 -mr-1 text-foreground transition-opacity hover:opacity-70 rounded-xl hover:bg-muted"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Cerrar menu" : "Abrir menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-5 border-t border-border flex flex-col gap-1 animate-menu-in">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground px-3 py-3 rounded-xl hover:text-brand-red hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 mt-2 border-t border-border">
              <Link
                href={siteConfig.urls.publicarChaza}
                className="rounded-full bg-brand-red px-5 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition hover:bg-brand-red-dark text-center block"
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

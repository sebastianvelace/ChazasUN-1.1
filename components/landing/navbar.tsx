"use client"

import { useState } from "react"
import Link from "next/link"
import { SquiggleIcon } from "./squiggle-icon"
import { Menu, X } from "lucide-react"
import { siteConfig } from "@/config/site"
import { useScrolled } from "@/hooks/use-scrolled"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "#inicio", label: "Inicio" },
  { href: "#explorar", label: "Vista previa" },
  { href: "#categorias", label: "Categorias" },
  { href: "#comentarios", label: "Comentarios" },
  { href: siteConfig.urls.blog, label: "Blog", isRoute: true },
]

const linkClass =
  "text-sm font-medium text-brand-red hover:text-brand-red-dark transition-colors duration-200 link-underline"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const scrolled = useScrolled()

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-brand-red/10"
          : "bg-white/95 backdrop-blur-sm shadow-md"
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/#inicio" className="flex items-center gap-3 group">
            <SquiggleIcon
              width={40}
              height={20}
              className="text-brand-red transition-transform duration-300 group-hover:scale-105"
            />
            <span className="font-stencil text-xl sm:text-2xl text-brand-red tracking-wider">
              CHAZAS UN
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href={siteConfig.urls.explorar} className={linkClass}>
              Explorar
            </Link>
            {navLinks.map((link) =>
              link.isRoute ? (
                <Link key={link.href} href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              ) : (
                <a key={link.href} href={link.href} className={linkClass}>
                  {link.label}
                </a>
              )
            )}
            <Link
              href={siteConfig.urls.publicarChaza}
              className="font-stencil text-sm bg-brand-red text-white px-5 py-2 rounded-full hover:bg-brand-red-dark transition-colors duration-300 active:scale-[0.98]"
            >
              PUBLICAR CHAZA
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden p-2 text-brand-red transition-opacity hover:opacity-80"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Cerrar menu" : "Abrir menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-brand-red/20 flex flex-col gap-4 animate-menu-in">
            <Link
              href={siteConfig.urls.explorar}
              className="text-brand-red font-medium px-2 py-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              Explorar
            </Link>
            {navLinks.map((link) =>
              link.isRoute ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-brand-red font-medium px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-brand-red font-medium px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              )
            )}
            <Link
              href={siteConfig.urls.publicarChaza}
              className="font-stencil text-sm bg-brand-red text-white px-5 py-2 rounded-full text-center transition-colors hover:bg-brand-red-dark"
              onClick={() => setMobileMenuOpen(false)}
            >
              PUBLICAR CHAZA
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}

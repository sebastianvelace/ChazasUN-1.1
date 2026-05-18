"use client"

import { useState } from "react"
import Link from "next/link"
import { SquiggleIcon } from "./squiggle-icon"
import { Menu, X } from "lucide-react"
import { siteConfig } from "@/config/site"

const navLinks = [
  { href: "#inicio", label: "Inicio" },
  { href: "#explorar", label: "Vista previa" },
  { href: "#categorias", label: "Categorias" },
  { href: "#comentarios", label: "Comentarios" },
  { href: siteConfig.urls.blog, label: "Blog", isRoute: true },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-md">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/#inicio" className="flex items-center gap-3 group">
            <SquiggleIcon
              width={40}
              height={20}
              className="text-brand-red transition-transform group-hover:scale-110"
            />
            <span className="font-stencil text-xl sm:text-2xl text-brand-red tracking-wider">
              CHAZAS UN
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href={siteConfig.urls.explorar}
              className="text-sm font-medium text-brand-red hover:text-brand-red-dark"
            >
              Explorar
            </Link>
            {navLinks.map((link) =>
              link.isRoute ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-brand-red hover:text-brand-red-dark"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-brand-red hover:text-brand-red-dark"
                >
                  {link.label}
                </a>
              )
            )}
            <Link
              href={siteConfig.urls.publicarChaza}
              className="font-stencil text-sm bg-brand-red text-white px-5 py-2 rounded-full hover:bg-brand-red-dark transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 btn-ripple"
            >
              PUBLICAR CHAZA
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden p-2 text-brand-red"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Cerrar menu" : "Abrir menu"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-brand-red/20 flex flex-col gap-4">
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
              className="font-stencil text-sm bg-brand-red text-white px-5 py-2 rounded-full text-center"
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

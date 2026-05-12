"use client"

import { useState } from "react"
import { SquiggleIcon } from "./squiggle-icon"
import { Menu, X } from "lucide-react"

const navLinks = [
  { href: "#inicio", label: "Inicio" },
  { href: "#explorar", label: "Explorar" },
  { href: "#como-funciona", label: "Cómo Funciona" },
  { href: "#comentarios", label: "Comentarios" },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-md">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="#inicio" className="flex items-center gap-3 group">
            <SquiggleIcon 
              width={40} 
              height={20} 
              className="text-brand-red transition-transform group-hover:scale-110" 
            />
            <span className="font-stencil text-xl sm:text-2xl text-brand-red tracking-wider">
              CHAZAS UN
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-brand-red hover:text-brand-red-dark relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-brand-red after:transition-all hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#registro"
              className="font-stencil text-sm bg-brand-red text-white px-5 py-2 rounded-full hover:bg-brand-red-dark transition-colors"
            >
              REGISTRARSE
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 text-brand-red"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-brand-red/20">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-base font-medium text-brand-red px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#registro"
                className="font-stencil text-sm bg-brand-red text-white px-5 py-2 rounded-full text-center hover:bg-brand-red-dark transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                REGISTRARSE
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

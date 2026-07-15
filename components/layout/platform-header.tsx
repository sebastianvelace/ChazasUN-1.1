"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo, useState } from "react"
import { Menu, X } from "lucide-react"
import { SquiggleIcon } from "@/components/landing/squiggle-icon"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { useSession } from "@/hooks/use-session"
import { useScrolled } from "@/hooks/use-scrolled"

export function PlatformHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { user, isLoggedIn, logout } = useSession()
  const scrolled = useScrolled()

  /* Hick's Law: max 4 links primarios. Guardadas siempre visible; último slot según sesión */
  const navItems = useMemo(() => {
    const base: { href: string; label: string }[] = [
      { href: siteConfig.urls.explorar,   label: "Explorar"   },
      { href: siteConfig.urls.mapa,       label: "Mapa"       },
      { href: siteConfig.urls.guardadas,  label: "Guardadas"  },
    ]
    if (isLoggedIn) {
      base.push({ href: siteConfig.urls.misChazas, label: "Mis chazas" })
    }
    // Blog oculto hasta el lanzamiento.
    return base
  }, [isLoggedIn])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "glass-nav" : "bg-background/95 backdrop-blur-sm border-b border-brand-red/5"
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <SquiggleIcon
              width={36}
              height={18}
              className="text-brand-red transition-transform duration-300 group-hover:scale-110"
            />
            <span className="font-stencil text-xl sm:text-2xl text-brand-red tracking-wider">CHASEEK</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-semibold transition-colors duration-200 link-underline",
                  pathname === item.href
                    ? "text-brand-red"
                    : "text-brand-red/70 hover:text-brand-red"
                )}
              >
                {item.label}
              </Link>
            ))}

            {/* Fitts: CTA con más área de clic */}
            <Link
              href={siteConfig.urls.publicarChaza}
              className="font-stencil text-sm bg-brand-red text-white px-6 py-2.5 rounded-xl
                         hover:bg-brand-red-dark transition-all duration-300 active:scale-[0.97]
                         shadow-md shadow-brand-red/20 hover:shadow-lg hover:shadow-brand-red/30
                         hover:-translate-y-0.5"
            >
              PUBLICAR CHAZA
            </Link>

            {/* Usuario — Gestalt: agrupado como unidad visual separada */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2 pl-2 border-l border-brand-red/15">
                <span className="text-xs font-semibold text-brand-red/70 max-w-[100px] truncate" title={user?.email}>
                  {user?.displayName}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs font-medium text-brand-red/50 hover:text-brand-red transition-colors px-2 py-1 rounded-lg hover:bg-brand-red/5"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link
                href={siteConfig.urls.login}
                className="text-sm font-semibold text-brand-red/60 hover:text-brand-red transition-colors pl-2 border-l border-brand-red/15"
              >
                Entrar
              </Link>
            )}
          </div>

          {/* Fitts: botón hamburguesa grande */}
          <button
            type="button"
            className="md:hidden p-3 -mr-1 text-brand-red rounded-xl hover:bg-brand-red/5 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Cerrar menu" : "Abrir menu"}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden py-5 border-t border-brand-red/10 flex flex-col gap-1 animate-menu-in">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "font-semibold px-3 py-3 rounded-xl transition-colors",
                  pathname === item.href
                    ? "text-brand-red bg-brand-red/5"
                    : "text-brand-red/80 hover:bg-brand-red/5"
                )}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 mt-2 border-t border-brand-red/10 flex flex-col gap-2">
              <Link
                href={siteConfig.urls.publicarChaza}
                className="font-stencil text-sm bg-brand-red text-white px-5 py-3 rounded-xl text-center
                           transition-colors hover:bg-brand-red-dark block"
                onClick={() => setOpen(false)}
              >
                PUBLICAR CHAZA
              </Link>
              {isLoggedIn ? (
                <button
                  type="button"
                  className="text-brand-red/60 font-medium text-sm text-left px-3 py-2 rounded-xl hover:bg-brand-red/5"
                  onClick={() => { logout(); setOpen(false) }}
                >
                  Salir ({user?.displayName ?? user?.email?.split("@")[0] ?? "cuenta"})
                </button>
              ) : (
                <Link
                  href={siteConfig.urls.login}
                  className="text-brand-red font-semibold px-3 py-2 rounded-xl hover:bg-brand-red/5 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Entrar
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

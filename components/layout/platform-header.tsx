"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo, useState } from "react"
import { Menu, X } from "lucide-react"
import { SquiggleIcon } from "@/components/landing/squiggle-icon"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { useSession } from "@/hooks/use-session"

export function PlatformHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { user, isLoggedIn, logout } = useSession()

  const navItems = useMemo(() => {
    const base: { href: string; label: string }[] = [
      { href: siteConfig.urls.explorar, label: "Explorar" },
      { href: siteConfig.urls.mapa, label: "Mapa" },
      { href: siteConfig.urls.recomendados, label: "Recomendados" },
      { href: siteConfig.urls.guardadas, label: "Guardadas" },
    ]
    if (isLoggedIn) {
      base.push({ href: siteConfig.urls.misChazas, label: "Mis chazas" })
    }
    base.push({ href: siteConfig.urls.blog, label: "Blog" })
    return base
  }, [isLoggedIn])

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-md">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <SquiggleIcon width={40} height={20} className="text-brand-red transition-transform group-hover:scale-110" />
            <span className="font-stencil text-xl sm:text-2xl text-brand-red tracking-wider">CHAZAS UN</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname === item.href ? "text-brand-red-dark" : "text-brand-red hover:text-brand-red-dark"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={siteConfig.urls.publicarChaza}
              className="font-stencil text-sm bg-brand-red text-white px-5 py-2 rounded-full hover:bg-brand-red-dark transition-all hover:scale-105"
            >
              PUBLICAR CHAZA
            </Link>
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 max-w-[120px] truncate" title={user?.email}>
                  {user?.displayName}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-brand-red"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link href={siteConfig.urls.login} className="text-sm text-gray-500 hover:text-brand-red">
                Entrar
              </Link>
            )}
          </div>

          <button
            type="button"
            className="md:hidden p-2 text-brand-red"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Cerrar menu" : "Abrir menu"}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden py-4 border-t border-brand-red/20 flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-brand-red font-medium px-2 py-1"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={siteConfig.urls.publicarChaza}
              className="font-stencil text-center bg-brand-red text-white px-5 py-2 rounded-full"
              onClick={() => setOpen(false)}
            >
              PUBLICAR CHAZA
            </Link>
            {isLoggedIn ? (
              <button
                type="button"
                className="text-brand-red font-medium text-left px-2 py-1"
                onClick={() => {
                  logout()
                  setOpen(false)
                }}
              >
                Salir ({user?.displayName})
              </button>
            ) : (
              <Link
                href={siteConfig.urls.login}
                className="text-brand-red font-medium px-2 py-1"
                onClick={() => setOpen(false)}
              >
                Entrar
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}

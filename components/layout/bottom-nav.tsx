"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, Map, Bookmark, User, LogIn } from "lucide-react"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { useSession } from "@/hooks/use-session"
import { useFavorites } from "@/hooks/use-favorites"

export function BottomNav() {
  const pathname = usePathname()
  const { isLoggedIn } = useSession()
  const { savedIds } = useFavorites()

  const isFocusedTask =
    pathname === siteConfig.urls.publicarChaza ||
    /^\/mis-chazas\/[^/]+\/editar\/?$/.test(pathname)

  if (isFocusedTask) return null

  const tabs = [
    {
      href: siteConfig.urls.explorar,
      label: "Explorar",
      icon: Compass,
    },
    {
      href: siteConfig.urls.mapa,
      label: "Mapa",
      icon: Map,
    },
    {
      href: siteConfig.urls.guardadas,
      label: "Guardadas",
      icon: Bookmark,
      badge: savedIds.length > 0,
    },
  ]

  const accountTab = {
    href: isLoggedIn ? siteConfig.urls.misChazas : siteConfig.urls.login,
    label: isLoggedIn ? "Mis chazas" : "Entrar",
    icon: isLoggedIn ? User : LogIn,
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200/80 bg-white/95 shadow-[0_-8px_24px_rgba(31,41,55,0.06)] backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navegación principal"
    >
      <div className="flex h-16 items-stretch">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors",
                isActive
                  ? "text-brand-red"
                  : "text-gray-400 hover:text-gray-600"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-red rounded-full" />
                )}
              </div>
              <span className="text-[10px] font-semibold tracking-wide leading-none">
                {tab.label}
              </span>
            </Link>
          )
        })}

        {/* Cuenta tab */}
        {(() => {
          const isActive =
            pathname === accountTab.href ||
            (isLoggedIn && pathname.startsWith(`${siteConfig.urls.misChazas}/`))
          const Icon = accountTab.icon
          return (
            <Link
              href={accountTab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors",
                isActive
                  ? "text-brand-red"
                  : "text-gray-400 hover:text-gray-600"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-semibold tracking-wide leading-none max-w-[60px] truncate">
                {accountTab.label}
              </span>
            </Link>
          )
        })()}
      </div>
    </nav>
  )
}

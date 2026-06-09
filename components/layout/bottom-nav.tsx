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
  const { isLoggedIn, user } = useSession()
  const { savedIds } = useFavorites()

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
    href: isLoggedIn ? "/perfil" : siteConfig.urls.login,
    label: isLoggedIn ? (user?.displayName ?? user?.email?.split("@")[0] ?? "Cuenta") : "Entrar",
    icon: isLoggedIn ? User : LogIn,
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
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
                  ? "text-brand-red bg-brand-red/5 rounded-xl mx-1"
                  : "text-gray-400 hover:text-gray-600"
              )}
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
          const isActive = pathname === accountTab.href || (isLoggedIn && pathname === "/perfil")
          const Icon = accountTab.icon
          return (
            <Link
              href={accountTab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors",
                isActive
                  ? "text-brand-red bg-brand-red/5 rounded-xl mx-1"
                  : "text-gray-400 hover:text-gray-600"
              )}
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

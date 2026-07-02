"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { mergeChazaCatalogClient } from "@/lib/data/chaza-repository"
import { getChazasAction } from "@/lib/actions/chazas"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"
import type { ChazaCard } from "@/types/chaza"

/** Con Supabase: chazas publicadas en DB. Sin env: seed + publicadas en localStorage. */
export function useChazaCatalog() {
  // Estado inicial identico en SSR y primer render del cliente (evita hydration mismatch).
  const [cards, setCards] = useState<ChazaCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = useCallback(async () => {
    if (typeof window === "undefined") return
    setLoading(true)
    setError(null)
    try {
      const canUseLocalDemo =
        !getSupabaseBrowserEnv() && process.env.NODE_ENV !== "production"
      if (canUseLocalDemo) {
        setCards(mergeChazaCatalogClient())
      } else {
        const fromDb = await getChazasAction()
        setCards(fromDb)
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error("No fue posible cargar el catálogo."))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    window.addEventListener("chazasun-published", refresh)
    return () => window.removeEventListener("chazasun-published", refresh)
  }, [refresh])

  return useMemo(() => ({ cards, refresh, loading, error }), [cards, refresh, loading, error])
}

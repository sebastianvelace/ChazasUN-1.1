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

  const refresh = useCallback(async () => {
    if (typeof window === "undefined") return
    setLoading(true)
    try {
      if (getSupabaseBrowserEnv()) {
        const fromDb = await getChazasAction()
        setCards(fromDb)
      } else {
        setCards(mergeChazaCatalogClient())
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    window.addEventListener("chazasun-published", refresh)
    return () => window.removeEventListener("chazasun-published", refresh)
  }, [refresh])

  return useMemo(() => ({ cards, refresh, loading }), [cards, refresh, loading])
}

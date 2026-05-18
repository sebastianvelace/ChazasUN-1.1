"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { mockChazaCards } from "@/lib/constants/mock-chazas"
import { mergeChazaCatalogClient } from "@/lib/data/chaza-repository"
import { getChazasAction } from "@/lib/actions/chazas"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"
import type { ChazaCard } from "@/types/chaza"

/** Con Supabase: chazas publicadas en DB. Sin env: seed + publicadas en localStorage. */
export function useChazaCatalog() {
  const [cards, setCards] = useState<ChazaCard[]>(() => {
    if (typeof window === "undefined") return mockChazaCards
    if (getSupabaseBrowserEnv()) return []
    return mergeChazaCatalogClient()
  })

  const refresh = useCallback(async () => {
    if (typeof window === "undefined") return
    if (getSupabaseBrowserEnv()) {
      const fromDb = await getChazasAction()
      setCards(fromDb)
    } else {
      setCards(mergeChazaCatalogClient())
    }
  }, [])

  useEffect(() => {
    void refresh()
    window.addEventListener("chazasun-published", refresh)
    return () => window.removeEventListener("chazasun-published", refresh)
  }, [refresh])

  return useMemo(() => ({ cards, refresh }), [cards, refresh])
}

"use client"

import { useCallback, useEffect, useRef } from "react"
import type { AnalyticsEventName, AnalyticsEventPayload } from "@/types/analytics"
import { trackEvent } from "@/lib/analytics"

export function useAnalytics() {
  const track = useCallback(
    (name: AnalyticsEventName, payload?: AnalyticsEventPayload) => {
      trackEvent(name, payload)
    },
    []
  )

  return { track }
}

/** Mide tiempo en una tarjeta del swiper (para métricas de entrega). */
export function useCardDwellTime(
  chazaId: string | undefined,
  onDwell: (durationMs: number, id: string) => void
) {
  const startedAt = useRef<number>(Date.now())
  const prevId = useRef<string | undefined>(chazaId)

  useEffect(() => {
    if (prevId.current && prevId.current !== chazaId) {
      const durationMs = Date.now() - startedAt.current
      onDwell(durationMs, prevId.current)
    }
    prevId.current = chazaId
    startedAt.current = Date.now()
  }, [chazaId, onDwell])
}

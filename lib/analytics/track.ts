import type { AnalyticsEvent, AnalyticsEventName, AnalyticsEventPayload } from "@/types/analytics"
import { getAnalyticsSessionId } from "./session"

const EVENTS_BUFFER_KEY = "chazasun_events_buffer"

function persistForDebug(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return
  try {
    const raw = sessionStorage.getItem(EVENTS_BUFFER_KEY)
    const buffer: AnalyticsEvent[] = raw ? JSON.parse(raw) : []
    buffer.push(event)
    if (buffer.length > 200) buffer.shift()
    sessionStorage.setItem(EVENTS_BUFFER_KEY, JSON.stringify(buffer))
  } catch {
    // ignore quota errors
  }
}

/**
 * Registra evento de producto sin PII.
 * En producción: enviar a Vercel Analytics custom events o tabla `analytics_events` en Supabase.
 */
export function trackEvent(
  name: AnalyticsEventName,
  payload?: AnalyticsEventPayload
): void {
  if (typeof window === "undefined") return

  const event: AnalyticsEvent = {
    name,
    payload,
    timestamp: new Date().toISOString(),
    sessionId: getAnalyticsSessionId(),
  }

  persistForDebug(event)

  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", event.name, event.payload)
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    void import("@/lib/actions/analytics").then(({ trackAnalyticsEventAction }) =>
      trackAnalyticsEventAction(event.sessionId, event.name, event.payload)
    )
  }

  // Vercel Analytics: descomentar cuando se configure track custom
  // import { track } from '@vercel/analytics'
  // track(name, payload as Record<string, string | number>)
}

export function getAnalyticsBuffer(): AnalyticsEvent[] {
  if (typeof window === "undefined") return []
  try {
    const raw = sessionStorage.getItem(EVENTS_BUFFER_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

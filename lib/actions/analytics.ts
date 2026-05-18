"use server"

import type { AnalyticsEventName, AnalyticsEventPayload } from "@/types/analytics"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { requireAdminSession } from "@/lib/admin/require-admin"
import { rowsToCsv } from "@/lib/utils/csv"

export async function trackAnalyticsEventAction(
  sessionId: string,
  name: AnalyticsEventName,
  payload?: AnalyticsEventPayload
): Promise<void> {
  if (!getSupabaseBrowserEnv()) return
  if (!sessionId?.trim()) return

  try {
    const supabase = await createServerSupabaseClient()
    await supabase.from("analytics_events").insert({
      session_id: sessionId,
      name,
      payload: payload ?? null,
    })
  } catch {
    /* no bloquear UI */
  }
}

export type AdminMetricsSummary = {
  chazasPublished: number
  reviewsCount: number
  favoritesCount: number
  eventsLast7d: number
  byEventName: Record<string, number>
  recentEvents: { name: string; created_at: string }[]
}

export async function getAdminMetricsAction(): Promise<
  { ok: true; data: AdminMetricsSummary } | { ok: false; error: string }
> {
  if (!getSupabaseBrowserEnv()) {
    return { ok: false, error: "Supabase no configurado." }
  }

  const adminResult = await requireAdminSession()
  if (!adminResult.ok) {
    return { ok: false, error: adminResult.error }
  }

  const supabase = adminResult.supabase
  const since = new Date()
  since.setDate(since.getDate() - 7)

  const [chazasRes, reviewsRes, favRes, eventsRes] = await Promise.all([
    supabase.from("chazas").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("reviews").select("id", { count: "exact", head: true }),
    supabase.from("favorites").select("user_id", { count: "exact", head: true }),
    supabase
      .from("analytics_events")
      .select("name, created_at")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false })
      .limit(500),
  ])

  const events = (eventsRes.data ?? []) as { name: string; created_at: string }[]
  const byEventName: Record<string, number> = {}
  for (const e of events) {
    byEventName[e.name] = (byEventName[e.name] ?? 0) + 1
  }

  return {
    ok: true,
    data: {
      chazasPublished: chazasRes.count ?? 0,
      reviewsCount: reviewsRes.count ?? 0,
      favoritesCount: favRes.count ?? 0,
      eventsLast7d: events.length,
      byEventName,
      recentEvents: events.slice(0, 20),
    },
  }
}

/** Exporta eventos para hojas de calculo. No subas el archivo a repos publicos (session_id es seudonimo). */
export async function exportAnalyticsCsvAction(opts?: {
  days?: number
}): Promise<{ ok: true; csv: string; filename: string } | { ok: false; error: string }> {
  if (!getSupabaseBrowserEnv()) {
    return { ok: false, error: "Supabase no configurado." }
  }

  const adminResult = await requireAdminSession()
  if (!adminResult.ok) {
    return { ok: false, error: adminResult.error }
  }

  const days = opts?.days ?? 7
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await adminResult.supabase
    .from("analytics_events")
    .select("created_at, session_id, name, payload")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(10000)

  if (error) {
    return { ok: false, error: error.message }
  }

  const rows = (data ?? []) as {
    created_at: string
    session_id: string
    name: string
    payload: unknown
  }[]

  const headers = ["created_at", "session_id", "name", "payload"]
  const body = rows.map((r) => [
    r.created_at,
    r.session_id ?? "",
    r.name ?? "",
    r.payload == null ? "" : JSON.stringify(r.payload),
  ])

  const csv = rowsToCsv(headers, body)
  const dayStamp = new Date().toISOString().slice(0, 10)
  return { ok: true, csv, filename: `chazasun-analytics-${dayStamp}.csv` }
}

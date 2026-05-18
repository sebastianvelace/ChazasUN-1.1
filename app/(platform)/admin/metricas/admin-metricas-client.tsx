"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { PageContainer, PageHeader } from "@/components/layout"
import { getAnalyticsBuffer } from "@/lib/analytics/track"
import { getAdminMetricsAction, exportAnalyticsCsvAction, type AdminMetricsSummary } from "@/lib/actions/analytics"
import {
  listPendingReportsAction,
  resolveReportAction,
  type ContentReportRow,
} from "@/lib/actions/reports"
import {
  listPublishedChazasFeaturedAdminAction,
  setChazaFeaturedAction,
  type AdminChazaFeaturedRow,
} from "@/lib/actions/admin-chaza-featured"
import {
  listPublishedChazasVerifyAdminAction,
  setChazaVerifiedAction,
  type AdminChazaVerifyRow,
} from "@/lib/actions/admin-chaza-verify"
import { isAdminMetricsUnlocked, unlockAdminMetricsFromQuery } from "@/lib/admin/metrics-access"
import type { AnalyticsEvent } from "@/types/analytics"
import { cn } from "@/lib/utils"

function download(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function summarizeLocal(events: AnalyticsEvent[]) {
  const byName = new Map<string, number>()
  const sessions = new Set<string>()
  const dwell: number[] = []
  for (const e of events) {
    byName.set(e.name, (byName.get(e.name) ?? 0) + 1)
    sessions.add(e.sessionId)
    if (e.name === "swiper_card_time" && e.payload?.durationMs != null) dwell.push(e.payload.durationMs)
  }
  const avgDwell = dwell.length ? Math.round(dwell.reduce((a, b) => a + b, 0) / dwell.length) : 0
  return {
    totalEvents: events.length,
    sessionCount: sessions.size,
    avgDwellMs: avgDwell,
    likes: byName.get("swiper_like") ?? 0,
    passes: byName.get("swiper_pass") ?? 0,
    byName: Object.fromEntries(byName),
  }
}

export function AdminMetricasClient() {
  const [mode, setMode] = useState<"loading" | "db" | "demo" | "denied">("loading")
  const [dbData, setDbData] = useState<AdminMetricsSummary | null>(null)
  const [dbError, setDbError] = useState<string | null>(null)
  const [events, setEvents] = useState<AnalyticsEvent[]>([])

  useEffect(() => {
    unlockAdminMetricsFromQuery()
    void getAdminMetricsAction().then((res) => {
      if (res.ok) {
        setDbData(res.data)
        setMode("db")
        return
      }
      if (isAdminMetricsUnlocked()) {
        setEvents(getAnalyticsBuffer())
        setMode("demo")
        return
      }
      setDbError(res.error)
      setMode("denied")
    })
  }, [])

  const localSummary = useMemo(() => summarizeLocal(events), [events])

  if (mode === "loading") {
    return (
      <PageContainer size="md">
        <p className="text-gray-500 text-sm">Cargando metricas…</p>
      </PageContainer>
    )
  }

  if (mode === "denied") {
    return (
      <PageContainer size="md">
        <PageHeader
          eyebrow="Interno"
          title="METRICAS"
          description="Panel de administracion. Requiere cuenta admin en Supabase o desbloqueo demo."
        />
        {dbError && <p className="text-sm text-gray-600 mb-4">{dbError}</p>}
        <p className="text-gray-600 text-sm mb-4">
          Para demo local, abre con <code className="bg-gray-100 px-1 rounded">?demo=1</code> una vez.
          En produccion: <code className="bg-gray-100 px-1 rounded">profiles.is_admin = true</code> o{" "}
          <code className="bg-gray-100 px-1 rounded">ADMIN_USER_IDS</code> en el servidor.
        </p>
        <Link
          href="/admin/metricas?demo=1"
          className="inline-block font-stencil bg-brand-red text-white px-6 py-2.5 rounded-full hover:bg-brand-red-dark"
        >
          Desbloquear demo local
        </Link>
      </PageContainer>
    )
  }

  if (mode === "db" && dbData) {
    return <AdminSupabaseDashboard initialMetrics={dbData} />
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Interno"
        title="METRICAS (DEMO LOCAL)"
        description="Buffer en sessionStorage de esta pestaña. Con admin en Supabase veras datos de DB."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Metric label="Eventos" value={String(localSummary.totalEvents)} />
        <Metric label="Sesiones (ids)" value={String(localSummary.sessionCount)} />
        <Metric label="Tiempo medio tarjeta" value={`${localSummary.avgDwellMs} ms`} />
        <Metric label="Likes / Pass" value={`${localSummary.likes} / ${localSummary.passes}`} />
      </div>
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          type="button"
          onClick={() => download("chazasun-analytics.json", JSON.stringify(events, null, 2), "application/json")}
          className="font-stencil text-sm bg-brand-red text-white px-5 py-2.5 rounded-full hover:bg-brand-red-dark"
        >
          EXPORTAR JSON
        </button>
        <button type="button" onClick={() => setEvents(getAnalyticsBuffer())} className="text-sm text-gray-600 underline">
          Refrescar
        </button>
      </div>
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm">
        <pre className="text-xs text-gray-600 whitespace-pre-wrap">{JSON.stringify(localSummary.byName, null, 2)}</pre>
      </div>
    </PageContainer>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="font-stencil text-2xl text-brand-red">{value}</p>
    </div>
  )
}

function AdminReportsQueue() {
  const [reports, setReports] = useState<ContentReportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    void listPendingReportsAction().then((r) => {
      if (r.ok) {
        setReports(r.reports)
        setErr(null)
      } else {
        setErr(r.error)
      }
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const run = async (reportId: string, action: "dismiss" | "hide_review" | "suspend_chaza") => {
    const payload =
      action === "dismiss"
        ? ({ reportId, action: "dismiss" } as const)
        : action === "hide_review"
          ? ({ reportId, action: "hide_review" } as const)
          : ({ reportId, action: "suspend_chaza" } as const)
    const res = await resolveReportAction(payload)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    toast.success("Listo.")
    load()
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando reportes…</p>
  }
  if (err) {
    return <p className="text-sm text-red-600">{err}</p>
  }
  if (reports.length === 0) {
    return <p className="text-sm text-gray-600">No hay reportes pendientes.</p>
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {reports.map((r) => (
          <li
            key={r.id}
            className="rounded-2xl border border-gray-100 bg-white p-4 text-sm text-gray-700 shadow-sm"
          >
            <div className="flex flex-wrap justify-between gap-2 mb-2">
              <span className="font-semibold uppercase text-xs text-brand-red">{r.target_type}</span>
              <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleString("es-CO")}</span>
            </div>
            <p className="text-xs text-gray-500 mb-1 font-mono break-all">Objetivo: {r.target_id}</p>
            <p className="mb-3">{r.reason}</p>
            {r.details && <p className="text-xs text-gray-500 mb-3 italic">{r.details}</p>}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void run(r.id, "dismiss")}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50"
              >
                Descartar
              </button>
              {r.target_type === "review" && (
                <button
                  type="button"
                  onClick={() => void run(r.id, "hide_review")}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 hover:bg-amber-200"
                >
                  Ocultar reseña
                </button>
              )}
              {r.target_type === "chaza" && (
                <button
                  type="button"
                  onClick={() => void run(r.id, "suspend_chaza")}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-red-100 text-red-800 hover:bg-red-200"
                >
                  Suspender chaza
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => load()} className="text-sm text-gray-600 underline">
        Refrescar cola
      </button>
    </div>
  )
}

function AdminChazaVerifyPanel() {
  const [items, setItems] = useState<AdminChazaVerifyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [busySlug, setBusySlug] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    void listPublishedChazasVerifyAdminAction().then((r) => {
      if (r.ok) {
        setItems(r.items)
        setErr(null)
      } else {
        setErr(r.error)
      }
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const toggle = async (slug: string, nextVerified: boolean) => {
    setBusySlug(slug)
    const res = await setChazaVerifiedAction(slug, nextVerified)
    setBusySlug(null)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    toast.success(nextVerified ? "Marcada como verificada." : "Verificacion quitada.")
    load()
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando chazas…</p>
  }
  if (err) {
    return <p className="text-sm text-red-600">{err}</p>
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Marca chazas que el equipo haya validado en campus. Esto <strong>no</strong> es aval de la UN ni sustituye
        moderacion por reportes.
      </p>
      <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {items.map((c) => (
          <li
            key={c.slug}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 text-sm"
          >
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">{c.name}</p>
              <p className="text-xs text-gray-500 font-mono truncate">{c.slug}</p>
              {c.verified_at && (
                <p className="text-xs text-emerald-700 mt-1">Verificada desde {new Date(c.verified_at).toLocaleDateString("es-CO")}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Link
                href={`/chazas/${c.slug}`}
                className="text-xs font-semibold text-brand-red hover:underline px-2 py-1"
              >
                Ver
              </Link>
              {c.verified_at ? (
                <button
                  type="button"
                  disabled={busySlug === c.slug}
                  onClick={() => void toggle(c.slug, false)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                >
                  Quitar
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busySlug === c.slug}
                  onClick={() => void toggle(c.slug, true)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Verificar
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => load()} className="text-sm text-gray-600 underline">
        Refrescar lista
      </button>
    </div>
  )
}

function isoToDatetimeLocalValue(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function addDaysDatetimeLocal(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function AdminFeaturedChazaRow({
  c,
  busy,
  onAfterChange,
}: {
  c: AdminChazaFeaturedRow
  busy: boolean
  onAfterChange: () => Promise<void>
}) {
  const [untilLocal, setUntilLocal] = useState(() => isoToDatetimeLocalValue(c.featured_until))
  const [rankStr, setRankStr] = useState(String(c.featured_rank ?? 0))
  const [pending, setPending] = useState(false)

  useEffect(() => {
    setUntilLocal(isoToDatetimeLocalValue(c.featured_until))
    setRankStr(String(c.featured_rank ?? 0))
  }, [c.featured_until, c.featured_rank])

  const disabled = busy || pending

  const save = async () => {
    if (!untilLocal.trim()) {
      toast.error("Indica fecha y hora de fin.")
      return
    }
    setPending(true)
    try {
      const untilIso = new Date(untilLocal).toISOString()
      const rank = Math.max(0, parseInt(rankStr, 10) || 0)
      const res = await setChazaFeaturedAction(c.slug, untilIso, rank)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success("Destacado guardado.")
      await onAfterChange()
    } finally {
      setPending(false)
    }
  }

  const clearFeatured = async () => {
    setPending(true)
    try {
      const res = await setChazaFeaturedAction(c.slug, null, null)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success("Destacado quitado.")
      await onAfterChange()
    } finally {
      setPending(false)
    }
  }

  const active =
    c.featured_until != null && new Date(c.featured_until) > new Date()

  return (
    <li className="rounded-2xl border border-gray-100 bg-white p-4 text-sm space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{c.name}</p>
          <p className="text-xs text-gray-500 font-mono truncate">{c.slug}</p>
          {active ? (
            <p className="text-xs text-amber-800 mt-1">
              En franja hasta {new Date(c.featured_until!).toLocaleString("es-CO")} · orden {c.featured_rank ?? 0}
            </p>
          ) : c.featured_until ? (
            <p className="text-xs text-gray-500 mt-1">Campana expirada; edita para reactivar.</p>
          ) : null}
        </div>
        <Link href={`/chazas/${c.slug}`} className="text-xs font-semibold text-brand-red hover:underline shrink-0">
          Ver
        </Link>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs text-gray-600 min-w-[10rem] flex-1">
          Fin destacado
          <input
            type="datetime-local"
            value={untilLocal}
            onChange={(e) => setUntilLocal(e.target.value)}
            className="rounded-lg border border-gray-200 px-2 py-1.5 text-gray-900 text-xs w-full"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-600 w-20">
          Orden
          <input
            type="number"
            min={0}
            value={rankStr}
            onChange={(e) => setRankStr(e.target.value)}
            className="rounded-lg border border-gray-200 px-2 py-1.5 text-gray-900 text-xs w-full"
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setUntilLocal(addDaysDatetimeLocal(7))}
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
        >
          +7 dias
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setUntilLocal(addDaysDatetimeLocal(30))}
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
        >
          +30 dias
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => void save()}
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-brand-red text-white hover:bg-brand-red-dark disabled:opacity-50"
        >
          Guardar
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => void clearFeatured()}
          className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
        >
          Quitar
        </button>
      </div>
    </li>
  )
}

function AdminChazaFeaturedPanel() {
  const [items, setItems] = useState<AdminChazaFeaturedRow[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await listPublishedChazasFeaturedAdminAction()
    if (r.ok) {
      setItems(r.items)
      setErr(null)
    } else {
      setErr(r.error)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const refresh = useCallback(async () => {
    setBusy(true)
    try {
      await load()
    } finally {
      setBusy(false)
    }
  }, [load])

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando chazas…</p>
  }
  if (err) {
    return <p className="text-sm text-red-600">{err}</p>
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Aparecen en una franja horizontal en <strong>/explorar</strong>. <strong>No</strong> cambian el orden del
        mazo del swiper.
      </p>
      <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {items.map((c) => (
          <AdminFeaturedChazaRow key={c.slug} c={c} busy={busy} onAfterChange={refresh} />
        ))}
      </ul>
      <button type="button" onClick={() => void refresh()} className="text-sm text-gray-600 underline">
        Refrescar lista
      </button>
    </div>
  )
}

function AdminSupabaseDashboard({ initialMetrics }: { initialMetrics: AdminMetricsSummary }) {
  const [tab, setTab] = useState<"metricas" | "reportes" | "verificar" | "destacados">("metricas")
  const [csvBusy, setCsvBusy] = useState(false)

  const tabBtn = (id: "metricas" | "reportes" | "verificar" | "destacados", label: string) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={cn(
        "font-stencil text-sm px-5 py-2 rounded-full transition-colors",
        tab === id ? "bg-brand-red text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      )}
    >
      {label}
    </button>
  )

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Interno"
        title="PANEL ADMIN"
        description="Metricas de producto, verificacion, destacados y cola de moderacion (Supabase)."
      />
      <div className="flex flex-wrap gap-2 mb-8">
        {tabBtn("metricas", "METRICAS")}
        {tabBtn("reportes", "REPORTES")}
        {tabBtn("verificar", "VERIFICAR")}
        {tabBtn("destacados", "DESTACADOS")}
      </div>

      {tab === "metricas" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Metric label="Chazas publicadas" value={String(initialMetrics.chazasPublished)} />
            <Metric label="Resenas" value={String(initialMetrics.reviewsCount)} />
            <Metric label="Favoritos" value={String(initialMetrics.favoritesCount)} />
            <Metric label="Eventos (7d)" value={String(initialMetrics.eventsLast7d)} />
          </div>
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              type="button"
              disabled={csvBusy}
              onClick={() => {
                setCsvBusy(true)
                void exportAnalyticsCsvAction({ days: 7 }).then((res) => {
                  setCsvBusy(false)
                  if (!res.ok) {
                    toast.error(res.error)
                    return
                  }
                  const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = res.filename
                  a.click()
                  URL.revokeObjectURL(url)
                  toast.success("CSV descargado (ultimos 7 dias, max 10000 filas).")
                })
              }}
              className="font-stencil text-sm bg-brand-red text-white px-5 py-2.5 rounded-full hover:bg-brand-red-dark disabled:opacity-50"
            >
              {csvBusy ? "EXPORTANDO..." : "EXPORTAR CSV"}
            </button>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm mb-8">
            <p className="font-semibold text-gray-700 mb-2">Eventos por nombre (7d)</p>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap">
              {JSON.stringify(initialMetrics.byEventName, null, 2)}
            </pre>
          </div>
          {initialMetrics.recentEvents.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-4 text-xs text-gray-600">
              <p className="font-semibold text-gray-700 mb-2 text-sm">Ultimos eventos</p>
              <ul className="space-y-1">
                {initialMetrics.recentEvents.map((e, i) => (
                  <li key={`${e.created_at}-${i}`}>
                    {e.name} · {new Date(e.created_at).toLocaleString("es-CO")}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : tab === "reportes" ? (
        <AdminReportsQueue />
      ) : tab === "verificar" ? (
        <AdminChazaVerifyPanel />
      ) : (
        <AdminChazaFeaturedPanel />
      )}
    </PageContainer>
  )
}

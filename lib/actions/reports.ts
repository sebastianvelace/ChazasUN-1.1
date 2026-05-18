"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { reportInputSchema } from "@/lib/validations/report"
import { requireAdminSession } from "@/lib/admin/require-admin"

export type ContentReportRow = {
  id: string
  reporter_id: string
  target_type: "chaza" | "review"
  target_id: string
  reason: string
  details: string | null
  status: string
  created_at: string
}

export async function createReportAction(
  raw: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!getSupabaseBrowserEnv()) {
    return { ok: false, error: "Supabase no configurado." }
  }

  const parsed = reportInputSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(" ") }
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: "Inicia sesion para reportar." }
  }

  const { targetType, targetId, reason, details } = parsed.data

  if (targetType === "chaza") {
    const { data: chaza } = await supabase.from("chazas").select("id").eq("id", targetId).maybeSingle()
    if (!chaza) return { ok: false, error: "Chaza no encontrada." }
  } else {
    const { data: rev } = await supabase.from("reviews").select("id").eq("id", targetId).maybeSingle()
    if (!rev) return { ok: false, error: "Resena no encontrada." }
  }

  const { error } = await supabase.from("content_reports").insert({
    reporter_id: user.id,
    target_type: targetType,
    target_id: targetId,
    reason,
    details: details?.trim() || null,
    status: "pending",
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true }
}

export async function listPendingReportsAction(): Promise<
  { ok: true; reports: ContentReportRow[] } | { ok: false; error: string }
> {
  const admin = await requireAdminSession()
  if (!admin.ok) return { ok: false, error: admin.error }

  const { data, error } = await admin.supabase
    .from("content_reports")
    .select("id, reporter_id, target_type, target_id, reason, details, status, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true })

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true, reports: (data ?? []) as ContentReportRow[] }
}

export type ResolveReportPayload =
  | { reportId: string; action: "dismiss" }
  | { reportId: string; action: "hide_review" }
  | { reportId: string; action: "suspend_chaza" }

export async function resolveReportAction(
  payload: ResolveReportPayload
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdminSession()
  if (!admin.ok) return { ok: false, error: admin.error }

  const { data: report, error: fetchErr } = await admin.supabase
    .from("content_reports")
    .select("id, target_type, target_id, status")
    .eq("id", payload.reportId)
    .maybeSingle()

  if (fetchErr || !report) {
    return { ok: false, error: fetchErr?.message ?? "Reporte no encontrado." }
  }

  if ((report as { status: string }).status !== "pending") {
    return { ok: false, error: "Este reporte ya fue procesado." }
  }

  const targetType = (report as { target_type: string }).target_type
  const targetId = (report as { target_id: string }).target_id

  if (payload.action === "dismiss") {
    const { error } = await admin.supabase
      .from("content_reports")
      .update({ status: "dismissed" })
      .eq("id", payload.reportId)
    if (error) return { ok: false, error: error.message }
    revalidatePath("/admin/metricas")
    return { ok: true }
  }

  if (payload.action === "hide_review") {
    if (targetType !== "review") {
      return { ok: false, error: "Este reporte no es sobre una resena." }
    }
    const { error: uErr } = await admin.supabase
      .from("reviews")
      .update({ status: "hidden" })
      .eq("id", targetId)
    if (uErr) return { ok: false, error: uErr.message }
    revalidatePath("/explorar")
    const { data: revRow } = await admin.supabase
      .from("reviews")
      .select("chaza_id")
      .eq("id", targetId)
      .maybeSingle()
    const chazaId = (revRow as { chaza_id?: string } | null)?.chaza_id
    if (chazaId) {
      const { data: ch } = await admin.supabase.from("chazas").select("slug").eq("id", chazaId).maybeSingle()
      const slug = (ch as { slug?: string } | null)?.slug
      if (slug) revalidatePath(`/chazas/${slug}`)
    }
  }

  if (payload.action === "suspend_chaza") {
    if (targetType !== "chaza") {
      return { ok: false, error: "Este reporte no es sobre una chaza." }
    }
    const { error: uErr } = await admin.supabase
      .from("chazas")
      .update({ status: "suspended" })
      .eq("id", targetId)
    if (uErr) return { ok: false, error: uErr.message }
    revalidatePath("/explorar")
    const { data: ch } = await admin.supabase.from("chazas").select("slug").eq("id", targetId).maybeSingle()
    const slug = (ch as { slug?: string } | null)?.slug
    if (slug) revalidatePath(`/chazas/${slug}`)
  }

  const { error: rErr } = await admin.supabase
    .from("content_reports")
    .update({ status: "resolved" })
    .eq("id", payload.reportId)

  if (rErr) return { ok: false, error: rErr.message }

  revalidatePath("/admin/metricas")
  revalidatePath("/explorar")
  revalidatePath("/mapa")

  return { ok: true }
}

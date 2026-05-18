"use server"

import { revalidatePath } from "next/cache"
import { requireAdminSession } from "@/lib/admin/require-admin"
import { isAdminUserId } from "@/lib/admin/is-admin"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export type AdminChazaVerifyRow = {
  slug: string
  name: string
  verified_at: string | null
}

export async function listPublishedChazasVerifyAdminAction(): Promise<
  { ok: true; items: AdminChazaVerifyRow[] } | { ok: false; error: string }
> {
  const session = await requireAdminSession()
  if (!session.ok) return { ok: false, error: session.error }

  const { data, error } = await session.supabase
    .from("chazas")
    .select("slug, name, verified_at")
    .eq("status", "published")
    .order("name", { ascending: true })

  if (error) return { ok: false, error: error.message }
  return { ok: true, items: (data ?? []) as AdminChazaVerifyRow[] }
}

export async function setChazaVerifiedAction(
  slug: string,
  verified: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireAdminSession()
  if (!session.ok) return { ok: false, error: session.error }

  const { data: profile } = await session.supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", session.user.id)
    .maybeSingle()
  const profileAdmin = Boolean((profile as { is_admin?: boolean } | null)?.is_admin)

  if (profileAdmin) {
    const { error } = await session.supabase.rpc("admin_set_chaza_verified", {
      p_slug: slug,
      p_verified: verified,
    })
    if (error) {
      const msg =
        error.message.includes("not allowed") || error.code === "42501"
          ? "Sin permisos de administrador en la base de datos."
          : error.message.includes("not found") || error.code === "P0002"
            ? "Chaza no encontrada."
            : error.message
      return { ok: false, error: msg }
    }
  } else if (isAdminUserId(session.user.id)) {
    try {
      const admin = createAdminSupabaseClient()
      const { data: updated, error } = await admin
        .from("chazas")
        .update({
          verified_at: verified ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("slug", slug)
        .select("id")
      if (error) return { ok: false, error: error.message }
      if (!updated?.length) return { ok: false, error: "Chaza no encontrada." }
    } catch (e) {
      return {
        ok: false,
        error:
          e instanceof Error ? e.message : "Falta SUPABASE_SERVICE_ROLE_KEY en el servidor para esta cuenta admin.",
      }
    }
  } else {
    return { ok: false, error: "Sin permisos." }
  }

  revalidatePath("/explorar")
  revalidatePath("/mapa")
  revalidatePath("/recomendados")
  revalidatePath("/guardadas")
  revalidatePath(`/chazas/${slug}`)
  revalidatePath("/mis-chazas")
  revalidatePath("/admin/metricas")
  return { ok: true }
}

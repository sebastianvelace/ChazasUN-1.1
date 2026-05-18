import type { User } from "@supabase/supabase-js"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { isAdminUserId } from "@/lib/admin/is-admin"

export type AdminSessionResult =
  | { ok: true; user: User; supabase: Awaited<ReturnType<typeof createServerSupabaseClient>> }
  | { ok: false; error: string }

export async function requireAdminSession(): Promise<AdminSessionResult> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: "Inicia sesion." }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle()

  const profileAdmin = Boolean((profile as { is_admin?: boolean } | null)?.is_admin)
  if (!profileAdmin && !isAdminUserId(user.id)) {
    return { ok: false, error: "Sin permisos de administrador." }
  }

  return { ok: true, user, supabase }
}

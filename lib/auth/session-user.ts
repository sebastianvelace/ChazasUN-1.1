import type { User } from "@supabase/supabase-js"

/** Usuario minimal para UI (header, reseñas, etc.). */
export interface SessionUser {
  id: string
  email: string
  displayName: string
}

export function mapSupabaseUserToSession(user: User): SessionUser {
  const meta = user.user_metadata as Record<string, unknown> | undefined
  const fromMeta =
    typeof meta?.display_name === "string" && meta.display_name.trim()
      ? meta.display_name.trim()
      : undefined
  const email = user.email ?? ""
  return {
    id: user.id,
    email,
    displayName: fromMeta ?? (email.includes("@") ? email.split("@")[0]! : "Usuario"),
  }
}

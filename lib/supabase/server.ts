import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"

/**
 * Cliente Supabase en Server Components, Route Handlers y Server Actions.
 */
export async function createServerSupabaseClient() {
  const env = getSupabaseBrowserEnv()
  if (!env) {
    throw new Error(
      "Supabase no configurado: añade NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY."
    )
  }
  const cookieStore = await cookies()

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          /* Server Component sin mutar cookies */
        }
      },
    },
  })
}

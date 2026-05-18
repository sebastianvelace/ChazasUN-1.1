"use client"

import { createBrowserClient } from "@supabase/ssr"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"

/** Cliente Supabase para Client Components. Requiere variables publicas en .env.local */
export function createBrowserSupabaseClient() {
  const env = getSupabaseBrowserEnv()
  if (!env) {
    throw new Error(
      "Supabase no configurado: añade NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY a .env.local"
    )
  }
  return createBrowserClient(env.url, env.anonKey)
}

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"

/**
 * Cliente anonimo sin cookies ni sesion. Sirve en `generateStaticParams` /
 * `generateMetadata` durante el build, donde `cookies()` no esta disponible.
 */
export function createPublicSupabaseClient(): SupabaseClient | null {
  const env = getSupabaseBrowserEnv()
  if (!env) return null
  return createClient(env.url, env.anonKey)
}

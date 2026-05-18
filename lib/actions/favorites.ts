"use server"

import { getSupabaseBrowserEnv } from "@/lib/supabase/env"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export type FavoritesPayload = { ok: true; liked: string[]; saved: string[] } | { ok: false; error: string }

async function listFavoriteChazaIds(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  userId: string
): Promise<{ liked: string[]; saved: string[] }> {
  const { data, error } = await supabase
    .from("favorites")
    .select("chaza_id, kind")
    .eq("user_id", userId)

  if (error || !data) {
    return { liked: [], saved: [] }
  }
  const liked: string[] = []
  const saved: string[] = []
  for (const row of data as { chaza_id: string; kind: string }[]) {
    if (row.kind === "like") liked.push(row.chaza_id)
    else if (row.kind === "save") saved.push(row.chaza_id)
  }
  return { liked, saved }
}

export async function getFavoritesAction(): Promise<FavoritesPayload> {
  if (!getSupabaseBrowserEnv()) {
    return { ok: false, error: "Sin Supabase" }
  }
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: "Sin sesión" }
  }
  const { liked, saved } = await listFavoriteChazaIds(supabase, user.id)
  return { ok: true, liked, saved }
}

/** Like: solo añade (idempotente). Save: alterna presencia en favoritos. */
export async function toggleFavoriteAction(
  chazaId: string,
  kind: "like" | "save"
): Promise<FavoritesPayload> {
  if (!getSupabaseBrowserEnv()) {
    return { ok: false, error: "Sin Supabase" }
  }
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: "Inicia sesión" }
  }

  if (kind === "like") {
    const { error } = await supabase.from("favorites").insert({
      user_id: user.id,
      chaza_id: chazaId,
      kind: "like",
    })
    const code = (error as { code?: string } | null)?.code
    if (error && code !== "23505") {
      return { ok: false, error: error.message }
    }
  } else {
    const { data: row } = await supabase
      .from("favorites")
      .select("chaza_id")
      .eq("user_id", user.id)
      .eq("chaza_id", chazaId)
      .eq("kind", "save")
      .maybeSingle()

    if (row) {
      const { error: delErr } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("chaza_id", chazaId)
        .eq("kind", "save")
      if (delErr) return { ok: false, error: delErr.message }
    } else {
      const { error: insErr } = await supabase.from("favorites").insert({
        user_id: user.id,
        chaza_id: chazaId,
        kind: "save",
      })
      if (insErr) return { ok: false, error: insErr.message }
    }
  }

  const { liked, saved } = await listFavoriteChazaIds(supabase, user.id)
  return { ok: true, liked, saved }
}

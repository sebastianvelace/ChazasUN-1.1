"use server"

import { revalidatePath } from "next/cache"
import { checkProfanity } from "@/lib/security/profanity"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { reviewSchema } from "@/lib/validations/review"
import type { Review } from "@/types/review"

type ReviewRow = {
  id: string
  chaza_id: string
  user_id: string
  rating: number
  body: string
  status: string
  created_at: string
  profiles: { display_name: string } | { display_name: string }[] | null
}

export async function getReviewsForChazaAction(chazaId: string): Promise<Review[]> {
  if (!getSupabaseBrowserEnv()) return []
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("reviews")
    .select("id, chaza_id, user_id, rating, body, status, created_at, profiles ( display_name )")
    .eq("chaza_id", chazaId)
    .eq("status", "published")
    .order("created_at", { ascending: false })

  if (error || !data) {
    console.error("[getReviewsForChazaAction]", error?.message)
    return []
  }

  return (data as unknown as ReviewRow[]).map((r) => {
    const prof = r.profiles
    const displayName =
      prof && !Array.isArray(prof)
        ? prof.display_name
        : Array.isArray(prof) && prof[0]
          ? (prof[0] as { display_name?: string }).display_name
          : undefined
    return {
      id: r.id,
      chazaId: r.chaza_id,
      authorId: r.user_id,
      authorDisplayName: displayName?.trim() || "Usuario",
      rating: r.rating,
      body: r.body,
      status: "published" as const,
      createdAt: r.created_at,
    }
  })
}

export async function createReviewAction(
  raw: unknown,
  slug: string
): Promise<{ ok: true; profanityAdjusted: boolean } | { ok: false; error: string }> {
  if (!getSupabaseBrowserEnv()) {
    return { ok: false, error: "Supabase no configurado." }
  }

  const parsed = reviewSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(" "),
    }
  }

  const prof = checkProfanity(parsed.data.body)
  const body = prof.filtered

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: "Inicia sesión para reseñar." }
  }

  const { error } = await supabase.from("reviews").insert({
    chaza_id: parsed.data.chazaId,
    user_id: user.id,
    rating: parsed.data.rating,
    body,
    status: "published",
  })

  if (error) {
    const code = (error as { code?: string }).code
    if (code === "23505") {
      return { ok: false, error: "Ya dejaste una reseña en esta chaza." }
    }
    return { ok: false, error: error.message }
  }

  revalidatePath(`/chazas/${slug}`)

  return { ok: true, profanityAdjusted: !prof.ok }
}

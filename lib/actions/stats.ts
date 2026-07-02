"use server"

import { getSupabaseBrowserEnv } from "@/lib/supabase/env"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { mockChazaCards } from "@/lib/constants/mock-chazas"
import { mockSeedReviews } from "@/lib/constants/mock-reviews"

export type PublicStats = {
  chazasPublished: number
  reviewsPublished: number
}

export async function getPublicStatsAction(): Promise<PublicStats> {
  if (process.env.CHAZAS_USE_MOCK_DATA === "true" || !getSupabaseBrowserEnv()) {
    return {
      chazasPublished: mockChazaCards.length,
      reviewsPublished: mockSeedReviews.length,
    }
  }

  const supabase = await createServerSupabaseClient()
  const [chRes, revRes] = await Promise.all([
    supabase.from("chazas").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "published"),
  ])

  return {
    chazasPublished: chRes.count ?? 0,
    reviewsPublished: revRes.count ?? 0,
  }
}

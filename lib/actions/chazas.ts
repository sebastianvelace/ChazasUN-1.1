"use server"

import type { ChazaCard } from "@/types/chaza"
import { getSeedChazaCards } from "@/lib/data/chaza-repository"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import {
  getChazaBySlugDb,
  listFeaturedChazasNow,
  listPublishedChazas,
} from "@/lib/data/supabase-chaza-repository"

export async function getChazasAction(): Promise<ChazaCard[]> {
  if (!getSupabaseBrowserEnv()) return getSeedChazaCards()
  const supabase = await createServerSupabaseClient()
  return listPublishedChazas(supabase)
}

export async function getFeaturedChazasAction(): Promise<ChazaCard[]> {
  if (!getSupabaseBrowserEnv()) return []
  const supabase = await createServerSupabaseClient()
  return listFeaturedChazasNow(supabase)
}

export async function getChazaBySlugAction(slug: string): Promise<ChazaCard | null> {
  if (!getSupabaseBrowserEnv()) return null
  const supabase = await createServerSupabaseClient()
  return getChazaBySlugDb(supabase, slug)
}

export async function getPublishedSlugsAction(): Promise<string[]> {
  if (!getSupabaseBrowserEnv()) return []
  const supabase = await createServerSupabaseClient()
  const { listAllPublishedSlugs } = await import("@/lib/data/supabase-chaza-repository")
  return listAllPublishedSlugs(supabase)
}

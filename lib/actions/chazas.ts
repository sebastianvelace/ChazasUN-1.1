"use server"

import type { ChazaCard } from "@/types/chaza"
import { getSeedChazaCards } from "@/lib/data/chaza-repository"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import {
  getChazaBySlugDb,
  listAllPublishedSlugs,
  listFeaturedChazasNow,
  listPublishedChazas,
} from "@/lib/data/supabase-chaza-repository"

// Override server-only para previews/e2e; producción nunca usa mocks por defecto.
const forceDemoCatalog = process.env.CHAZAS_USE_MOCK_DATA === "true"
const canUseDemoCatalog = process.env.NODE_ENV !== "production" || forceDemoCatalog

function getDemoChazaBySlug(slug: string): ChazaCard | null {
  return getSeedChazaCards().find((chaza) => chaza.slug === slug) ?? null
}

function requireSupabaseConfiguration() {
  if (getSupabaseBrowserEnv()) return
  throw new Error("El catálogo no está disponible porque Supabase no está configurado.")
}

export async function getChazasAction(): Promise<ChazaCard[]> {
  if (forceDemoCatalog) return getSeedChazaCards()

  if (!getSupabaseBrowserEnv()) {
    if (canUseDemoCatalog) return getSeedChazaCards()
    requireSupabaseConfiguration()
  }

  try {
    const supabase = await createServerSupabaseClient()
    return await listPublishedChazas(supabase)
  } catch (error) {
    if (canUseDemoCatalog) {
      console.warn("[chazas-action] Supabase no disponible; usando catálogo demo.", error)
      return getSeedChazaCards()
    }
    throw error
  }
}

export async function getFeaturedChazasAction(): Promise<ChazaCard[]> {
  if (forceDemoCatalog) return []

  if (!getSupabaseBrowserEnv()) {
    if (canUseDemoCatalog) return []
    requireSupabaseConfiguration()
  }

  try {
    const supabase = await createServerSupabaseClient()
    return await listFeaturedChazasNow(supabase)
  } catch (error) {
    if (canUseDemoCatalog) {
      console.warn("[chazas-action] Destacadas no disponibles en modo demo.", error)
      return []
    }
    throw error
  }
}

export async function getChazaBySlugAction(slug: string): Promise<ChazaCard | null> {
  if (forceDemoCatalog) return getDemoChazaBySlug(slug)

  if (!getSupabaseBrowserEnv()) {
    if (canUseDemoCatalog) return getDemoChazaBySlug(slug)
    requireSupabaseConfiguration()
  }

  try {
    const supabase = await createServerSupabaseClient()
    return await getChazaBySlugDb(supabase, slug)
  } catch (error) {
    if (canUseDemoCatalog) {
      console.warn("[chazas-action] Detalle remoto no disponible; usando catálogo demo.", error)
      return getDemoChazaBySlug(slug)
    }
    throw error
  }
}

export async function getPublishedSlugsAction(): Promise<string[]> {
  if (forceDemoCatalog) return getSeedChazaCards().map((chaza) => chaza.slug)

  if (!getSupabaseBrowserEnv()) {
    if (canUseDemoCatalog) return getSeedChazaCards().map((chaza) => chaza.slug)
    requireSupabaseConfiguration()
  }

  try {
    const supabase = await createServerSupabaseClient()
    return await listAllPublishedSlugs(supabase)
  } catch (error) {
    if (canUseDemoCatalog) {
      console.warn("[chazas-action] Slugs remotos no disponibles; usando catálogo demo.", error)
      return getSeedChazaCards().map((chaza) => chaza.slug)
    }
    throw error
  }
}

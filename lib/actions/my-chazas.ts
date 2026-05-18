"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { updateChazaSchema, type UpdateChazaInput } from "@/lib/validations/chaza"
import { geoFromMapPercent } from "@/lib/data/publish-helpers"
import type { ChazaProductRow } from "@/lib/actions/chaza-products"

export type MyChazaRow = {
  id: string
  slug: string
  name: string
  status: string
  cover_image_url: string | null
}

export async function listMyChazasAction(): Promise<
  { ok: true; items: MyChazaRow[] } | { ok: false; error: string }
> {
  if (!getSupabaseBrowserEnv()) {
    return { ok: false, error: "Supabase no configurado." }
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: "Inicia sesion." }
  }

  const { data, error } = await supabase
    .from("chazas")
    .select("id, slug, name, status, cover_image_url")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true, items: (data ?? []) as MyChazaRow[] }
}

export type ChazaEditPayload = {
  slug: string
  name: string
  description: string
  location_text: string
  schedule: string
  contact_whatsapp: string | null
  contact_instagram: string | null
  map_position: { x: number; y: number }
  geo: { lat: number; lng: number }
  status: string
  products: ChazaProductRow[]
}

export async function getChazaForEditAction(
  slug: string
): Promise<{ ok: true; data: ChazaEditPayload } | { ok: false; error: string }> {
  if (!getSupabaseBrowserEnv()) {
    return { ok: false, error: "Supabase no configurado." }
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: "Inicia sesion." }
  }

  const { data, error } = await supabase
    .from("chazas")
    .select(
      "id, slug, name, description, location_text, schedule, contact_whatsapp, contact_instagram, map_position, geo, status, owner_id"
    )
    .eq("slug", slug)
    .maybeSingle()

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Chaza no encontrada." }
  }
  const row = data as ChazaEditPayload & { owner_id: string; id: string }
  if (row.owner_id !== user.id) {
    return { ok: false, error: "No eres el dueno de esta chaza." }
  }

  const { data: prods } = await supabase
    .from("chaza_products")
    .select("name, price_label, sort_order")
    .eq("chaza_id", row.id)
    .order("sort_order", { ascending: true })

  const products: ChazaProductRow[] = (prods ?? []).map((p) => ({
    name: (p as { name: string }).name,
    priceLabel: ((p as { price_label: string | null }).price_label ?? "").trim(),
  }))

  const { owner_id: _, id: __, ...rest } = row
  const mp = rest.map_position as { x: number; y: number } | null
  return {
    ok: true,
    data: {
      slug: rest.slug,
      name: rest.name,
      description: rest.description,
      location_text: rest.location_text,
      schedule: rest.schedule,
      contact_whatsapp: rest.contact_whatsapp,
      contact_instagram: rest.contact_instagram,
      map_position: mp ?? { x: 50, y: 50 },
      geo: (rest.geo as { lat: number; lng: number }) ?? geoFromMapPercent(50, 50),
      status: rest.status,
      products,
    },
  }
}

export async function updateMyChazaAction(
  slug: string,
  raw: UpdateChazaInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!getSupabaseBrowserEnv()) {
    return { ok: false, error: "Supabase no configurado." }
  }

  const parsed = updateChazaSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(" ") }
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: "Inicia sesion." }
  }

  const { data: existing, error: exErr } = await supabase
    .from("chazas")
    .select("id, owner_id, slug, status")
    .eq("slug", slug)
    .maybeSingle()

  if (exErr || !existing) {
    return { ok: false, error: exErr?.message ?? "Chaza no encontrada." }
  }
  const row = existing as { id: string; owner_id: string; status: string }
  if (row.owner_id !== user.id) {
    return { ok: false, error: "No puedes editar esta chaza." }
  }
  if (row.status === "suspended") {
    return { ok: false, error: "Esta chaza esta suspendida. Contacta al equipo si crees que es un error." }
  }

  const d = parsed.data
  const allowed = new Set(["draft", "published", "paused"])
  if (!allowed.has(d.status)) {
    return { ok: false, error: "Estado no permitido." }
  }

  const geo = geoFromMapPercent(d.mapPosition.x, d.mapPosition.y)

  const { error } = await supabase
    .from("chazas")
    .update({
      name: d.name.trim(),
      description: d.description.trim(),
      location_text: d.locationText.trim(),
      schedule: d.schedule.trim(),
      contact_whatsapp: d.whatsapp?.trim() || null,
      contact_instagram: d.instagram?.trim() || null,
      map_position: d.mapPosition,
      geo,
      status: d.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", (existing as { id: string }).id)

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath("/explorar")
  revalidatePath("/mapa")
  revalidatePath("/mis-chazas")
  revalidatePath(`/chazas/${slug}`)

  return { ok: true }
}

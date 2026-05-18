"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { productsListSchema, type ProductRowInput } from "@/lib/validations/chaza"
import { checkProfanity } from "@/lib/security/profanity"

export type ChazaProductRow = { name: string; priceLabel: string }

export async function getChazaProductsBySlugAction(
  slug: string
): Promise<{ ok: true; products: ChazaProductRow[] } | { ok: false; error: string }> {
  if (!getSupabaseBrowserEnv()) {
    return { ok: false, error: "Supabase no configurado." }
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: chaza, error: cErr } = await supabase
    .from("chazas")
    .select("id, status, owner_id")
    .eq("slug", slug)
    .maybeSingle()

  if (cErr || !chaza) {
    return { ok: false, error: cErr?.message ?? "Chaza no encontrada." }
  }

  const row = chaza as { id: string; status: string; owner_id: string }
  const isOwner = user?.id === row.owner_id
  const visibleToPublic = row.status === "published"

  if (!visibleToPublic && !isOwner) {
    return { ok: true, products: [] }
  }

  const { data: prods, error: pErr } = await supabase
    .from("chaza_products")
    .select("name, price_label, sort_order")
    .eq("chaza_id", row.id)
    .order("sort_order", { ascending: true })

  if (pErr) {
    return { ok: false, error: pErr.message }
  }

  const products = (prods ?? []).map((p) => ({
    name: (p as { name: string }).name,
    priceLabel: ((p as { price_label: string | null }).price_label ?? "").trim(),
  }))

  return { ok: true, products }
}

export async function replaceChazaProductsAction(
  slug: string,
  raw: ProductRowInput[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!getSupabaseBrowserEnv()) {
    return { ok: false, error: "Supabase no configurado." }
  }

  const parsed = productsListSchema.safeParse(raw)
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
    .select("id, owner_id, status, slug")
    .eq("slug", slug)
    .maybeSingle()

  if (exErr || !existing) {
    return { ok: false, error: exErr?.message ?? "Chaza no encontrada." }
  }
  const ch = existing as { id: string; owner_id: string; status: string; slug: string }
  if (ch.owner_id !== user.id) {
    return { ok: false, error: "No puedes editar esta chaza." }
  }
  if (ch.status === "suspended") {
    return { ok: false, error: "Chaza suspendida; no se puede editar la carta." }
  }

  const cleaned = parsed.data
    .map((p) => ({
      name: p.name.trim(),
      priceLabel: p.priceLabel.trim(),
    }))
    .filter((p) => p.name.length > 0)

  const { error: delErr } = await supabase.from("chaza_products").delete().eq("chaza_id", ch.id)
  if (delErr) {
    return { ok: false, error: delErr.message }
  }

  if (cleaned.length === 0) {
    revalidatePath("/explorar")
    revalidatePath("/mapa")
    revalidatePath("/mis-chazas")
    revalidatePath(`/mis-chazas/${slug}/editar`)
    revalidatePath(`/chazas/${slug}`)
    return { ok: true }
  }

  const rows = cleaned.map((p, i) => {
    const prof = checkProfanity(p.name)
    return {
      chaza_id: ch.id,
      name: prof.filtered,
      price_label: p.priceLabel || null,
      sort_order: i,
    }
  })

  const { error: insErr } = await supabase.from("chaza_products").insert(rows)
  if (insErr) {
    return { ok: false, error: insErr.message }
  }

  revalidatePath("/explorar")
  revalidatePath("/mapa")
  revalidatePath("/mis-chazas")
  revalidatePath(`/mis-chazas/${slug}/editar`)
  revalidatePath(`/chazas/${slug}`)

  return { ok: true }
}

"use server"

import { revalidatePath } from "next/cache"
import { categories } from "@/config/categories"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { geoFromMapPercent } from "@/lib/data/publish-helpers"
import { slugify } from "@/lib/utils/slugify"
import { publishChazaSchema, type PublishChazaInput } from "@/lib/validations/chaza"
import { categorySlugExists } from "@/lib/data/chaza-repository"

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=700&fit=crop"

export type PublishChazaResult =
  | { ok: true; slug: string; id: string }
  | { ok: false; error: string }

export async function publishChazaAction(raw: PublishChazaInput): Promise<PublishChazaResult> {
  if (!getSupabaseBrowserEnv()) {
    return { ok: false, error: "Supabase no está configurado en el servidor." }
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: "Inicia sesión para publicar." }
  }

  const parsed = publishChazaSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((e) => e.message).join(" "),
    }
  }

  const data = parsed.data
  const categorySlugs = data.categorySlugs.filter((s) => categorySlugExists(s))
  if (!categorySlugs.length) {
    return { ok: false, error: "Elige al menos una categoría válida." }
  }

  const { data: catRows, error: catErr } = await supabase
    .from("categories")
    .select("id, slug")
    .in("slug", categorySlugs)
  if (catErr || !catRows?.length) {
    return { ok: false, error: catErr?.message ?? "No se pudieron resolver categorías." }
  }

  const cover = data.coverImageUrl.trim() ? data.coverImageUrl : PLACEHOLDER_IMAGE
  const geo = geoFromMapPercent(data.mapPosition.x, data.mapPosition.y)
  const names = categorySlugs
    .map((s) => categories.find((c) => c.slug === s)?.name)
    .filter(Boolean) as string[]
  const tags = [...names.slice(0, 3), ...data.products.map((p) => p.name).slice(0, 3)].slice(0, 6)
  const wa = data.whatsapp?.trim()
  const ig = data.instagram?.trim()

  let priceFrom = "Consultar"
  if (data.products.length > 0) {
    const first = data.products.find((p) => p.priceLabel.trim())
    priceFrom = first?.priceLabel?.trim() || "Consultar"
  }

  const baseSlug = slugify(data.name.trim()) || "chaza"
  let slug = baseSlug
  let suffix = 0
  let chazaId: string | null = null
  let lastErr: string | undefined

  while (!chazaId) {
    const { data: inserted, error: insErr } = await supabase
      .from("chazas")
      .insert({
        owner_id: user.id,
        slug,
        name: data.name.trim(),
        description: data.description.trim(),
        location_text: data.locationText.trim(),
        schedule: data.schedule.trim(),
        cover_image_url: cover,
        map_position: data.mapPosition,
        geo,
        contact_whatsapp: wa || null,
        contact_instagram: ig || null,
        tags: tags.length ? tags : ["Nuevo"],
        rating: 0,
        review_count: 0,
        status: "published",
      })
      .select("id")
      .single()

    if (!insErr && inserted?.id) {
      chazaId = inserted.id as string
      break
    }

    lastErr = insErr?.message
    const code = (insErr as { code?: string } | null)?.code
    if (code === "23505") {
      suffix += 1
      slug = `${baseSlug}-${suffix}`
      continue
    }
    return { ok: false, error: lastErr ?? "No se pudo crear la chaza." }
  }

  if (!chazaId) {
    return { ok: false, error: lastErr ?? "No se pudo crear la chaza." }
  }

  const joinRows = catRows.map((c: { id: string; slug: string }) => ({
    chaza_id: chazaId,
    category_id: c.id,
  }))
  const { error: jErr } = await supabase.from("chaza_categories").insert(joinRows)
  if (jErr) {
    console.error("[publishChazaAction] chaza_categories", jErr.message)
  }

  const productRows = data.products
    .filter((p) => p.name.trim())
    .map((p, i) => ({
      chaza_id: chazaId,
      name: p.name.trim(),
      price_label: p.priceLabel.trim() || null,
      sort_order: i,
    }))

  if (productRows.length) {
    const { error: pErr } = await supabase.from("chaza_products").insert(productRows)
    if (pErr) console.error("[publishChazaAction] chaza_products", pErr.message)
  } else if (priceFrom !== "Consultar") {
    await supabase.from("chaza_products").insert({
      chaza_id: chazaId,
      name: "Popular",
      price_label: priceFrom,
      sort_order: 0,
    })
  }

  revalidatePath("/explorar")
  revalidatePath("/mapa")
  revalidatePath("/guardadas")
  revalidatePath("/recomendados")
  revalidatePath(`/chazas/${slug}`)

  return { ok: true, slug, id: chazaId }
}

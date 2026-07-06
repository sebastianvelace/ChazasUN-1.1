/**
 * Pobla chazas demo desde lib/constants/mock-chazas.ts (idempotente por slug).
 * Requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env o .env.local.
 * Para CREAR el usuario demo (primera corrida) tambien requiere SEED_DEMO_PASSWORD
 * en el entorno. Nunca hardcodear la contrasena aca: termina en el historial de git.
 */

import { config } from "dotenv"
import { resolve } from "node:path"
import { mockChazaCards } from "@/lib/constants/mock-chazas"
import { inferCategorySlugsFromLabel } from "@/lib/data/chaza-repository"
import type { SupabaseClient } from "@supabase/supabase-js"

config({ path: resolve(process.cwd(), ".env.local") })
config({ path: resolve(process.cwd(), ".env") })

const DEMO_EMAIL = process.env.SEED_DEMO_EMAIL ?? "demo@chazasun.local"
const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD

async function getOrCreateDemoOwnerId(admin: SupabaseClient): Promise<string> {
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
  if (listErr) throw listErr
  const found = list.users.find((u) => u.email?.toLowerCase() === DEMO_EMAIL)
  if (found) return found.id

  if (!DEMO_PASSWORD) {
    throw new Error(
      "Falta SEED_DEMO_PASSWORD en el entorno para crear el usuario demo. Definila con un valor secreto (no la hardcodees en el repo)."
    )
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { display_name: "Usuario demo (seed)" },
  })
  if (error) throw error
  if (!data.user?.id) throw new Error("createUser no devolvió user.id")
  return data.user.id
}

async function main() {
  const { createAdminSupabaseClient } = await import("@/lib/supabase/admin")
  const admin = createAdminSupabaseClient()

  const ownerId = await getOrCreateDemoOwnerId(admin)
  console.log("Owner demo (profiles.id):", ownerId)

  const { data: categories, error: catErr } = await admin.from("categories").select("id, slug")
  if (catErr || !categories?.length) {
    throw new Error(`No se pudieron leer categories: ${catErr?.message ?? "sin filas"}`)
  }
  const slugToCategoryId = new Map(categories.map((c: { id: string; slug: string }) => [c.slug, c.id]))

  let inserted = 0
  let skipped = 0

  for (const card of mockChazaCards) {
    const { data: existing } = await admin.from("chazas").select("id").eq("slug", card.slug).maybeSingle()
    if (existing) {
      skipped++
      continue
    }

    const { data: chazaRow, error: insErr } = await admin
      .from("chazas")
      .insert({
        owner_id: ownerId,
        slug: card.slug,
        name: card.name,
        description: card.description,
        location_text: card.location,
        schedule: card.schedule,
        cover_image_url: card.image,
        map_position: card.mapPosition ?? null,
        geo: card.geo ?? null,
        building_code: card.buildingCode ?? null,
        contact_whatsapp: card.contactWhatsApp ?? null,
        contact_instagram: card.contactInstagram ?? null,
        tags: card.tags,
        rating: card.rating,
        review_count: card.reviews,
        status: "published",
      })
      .select("id")
      .single()

    if (insErr || !chazaRow) {
      console.error("Error insertando", card.slug, insErr?.message)
      continue
    }

    const chazaId = chazaRow.id as string
    const slugs = card.categorySlugs?.length ? card.categorySlugs : inferCategorySlugsFromLabel(card.category)
    const seenCat = new Set<string>()
    const catsPayload: { chaza_id: string; category_id: string }[] = []
    for (const s of slugs) {
      const cid = slugToCategoryId.get(s)
      if (!cid) console.warn(`  Categoria desconocida en DB: ${s} (chaza ${card.slug})`)
      else if (!seenCat.has(cid)) {
        seenCat.add(cid)
        catsPayload.push({ chaza_id: chazaId, category_id: cid })
      }
    }
    if (catsPayload.length) {
      const { error: jcErr } = await admin.from("chaza_categories").insert(catsPayload)
      if (jcErr) console.error("chaza_categories", card.slug, jcErr.message)
    }

    const { error: pErr } = await admin.from("chaza_products").insert({
      chaza_id: chazaId,
      name: "Popular",
      price_label: card.price,
      sort_order: 0,
    })
    if (pErr) console.error("chaza_products", card.slug, pErr.message)

    const { data: existingRev } = await admin
      .from("reviews")
      .select("id")
      .eq("chaza_id", chazaId)
      .eq("user_id", ownerId)
      .maybeSingle()
    if (!existingRev) {
      const bodies = [
        "Muy buena atencion, volvere.",
        "Precios justos para estudiantes.",
        "Recomendado; rapido el servicio.",
        "Buena calidad, ideal para la UN.",
        "Probado entre clases, cumple.",
      ]
      const { error: revErr } = await admin.from("reviews").insert({
        chaza_id: chazaId,
        user_id: ownerId,
        rating: 4 + (inserted % 2),
        body: bodies[inserted % bodies.length],
        status: "published",
      })
      if (revErr) console.error("reviews", card.slug, revErr.message)
    }

    inserted++
  }

  console.log(`Listo: ${inserted} chazas insertadas, ${skipped} omitidas (slug ya existía).`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

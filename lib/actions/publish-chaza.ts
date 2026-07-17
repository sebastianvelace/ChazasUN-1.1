"use server"

import { revalidatePath } from "next/cache"
import { categories } from "@/config/categories"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { geoFromMapPercent } from "@/lib/data/publish-helpers"
import { slugify } from "@/lib/utils/slugify"
import { publishChazaSchema, type PublishChazaInput } from "@/lib/validations/chaza"
import { CHAZA_COVER_PLACEHOLDER } from "@/lib/constants/chaza-images"
import { categorySlugExists } from "@/lib/data/chaza-repository"

export type PublishChazaResult =
  | { ok: true; slug: string; id: string }
  | { ok: false; error: string }

// Server Action: registra una chaza de forma atómica-por-fases. Corre SOLO en el
// servidor ("use server"), por lo que la clave de Supabase y esta lógica nunca
// viajan al navegador. El flujo es: autenticar -> validar -> resolver categorías
// -> insertar chaza (con reintento de slug) -> insertar relaciones -> revalidar.
export async function publishChazaAction(raw: PublishChazaInput): Promise<PublishChazaResult> {
  if (!getSupabaseBrowserEnv()) {
    return { ok: false, error: "Supabase no está configurado en el servidor." }
  }

  // 1) Autenticación. getUser() valida el JWT contra el servidor de Auth (no solo
  //    decodifica la cookie), así que aquí `user` es una identidad real. Este
  //    user.id será el owner_id de la chaza; la política RLS chazas_insert_own
  //    exige que owner_id = auth.uid(), de modo que nadie puede publicar a nombre
  //    de otro aunque manipule el payload.
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: "Inicia sesión para publicar." }
  }

  // 2) Validación de forma con Zod. Primera de dos capas de defensa: si el payload
  //    no cumple el esquema (campos requeridos, longitudes), se rechaza aquí antes
  //    de tocar la base. La segunda capa son las restricciones de la propia tabla
  //    (checks, unique, foreign keys), que ni siquiera esta acción puede saltar.
  const parsed = publishChazaSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((e) => e.message).join(" "),
    }
  }

  const data = parsed.data
  // La portada debe ser una URL (imagen ya subida a Storage), no un data:base64.
  // Guardar base64 en una columna de texto inflaría la fila y la haría lenta de leer;
  // por eso el wizard sube la imagen primero y aquí solo aceptamos su URL.
  if (/^data:image\//i.test(data.coverImageUrl.trim())) {
    return { ok: false, error: "Sube la imagen antes de publicar. No guardamos imagenes base64 en la base de datos." }
  }

  // 3) Resolver categorías. El cliente manda *slugs* (texto legible como "comida");
  //    la tabla puente chaza_categories necesita los *id* (uuid). Primero filtramos
  //    contra el catálogo conocido y luego traducimos slug -> id consultando la BD,
  //    en una sola query con .in(). Nunca confiamos en ids que venga del cliente.
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

  // 4) Preparar los campos derivados antes de insertar.
  const cover = data.coverImageUrl.trim() ? data.coverImageUrl : CHAZA_COVER_PLACEHOLDER
  // El wizard entrega la posición como % del plano del campus (0–100); la traducimos
  // a lat/lng reales para poder abrir la chaza en Google Maps desde la ficha.
  const geo = geoFromMapPercent(data.mapPosition.x, data.mapPosition.y)
  // tags = primeras 3 categorías + primeros 3 productos (máx 6). Son etiquetas de
  // apoyo para búsqueda/visualización; no reemplazan la relación real de categorías.
  const names = categorySlugs
    .map((s) => categories.find((c) => c.slug === s)?.name)
    .filter(Boolean) as string[]
  const tags = [...names.slice(0, 3), ...data.products.map((p) => p.name).slice(0, 3)].slice(0, 6)
  const wa = data.whatsapp?.trim()
  const ig = data.instagram?.trim()

  // 5) Insertar la chaza con reintento de slug único.
  //    El slug ("mi-chaza") va en la URL y la tabla lo declara UNIQUE. Si dos chazas
  //    tienen el mismo nombre, el segundo insert viola esa restricción. En vez de
  //    fallar, reintentamos con sufijo (mi-chaza-2, mi-chaza-3, …). Postgres avisa
  //    la colisión con el código de error 23505 (unique_violation); cualquier otro
  //    error se propaga tal cual. El tope de 10 evita un bucle infinito.
  const MAX_SLUG_ATTEMPTS = 10
  const baseSlug = slugify(data.name.trim()) || "chaza"
  let slug = baseSlug
  let suffix = 0
  let chazaId: string | null = null
  let lastErr: string | undefined

  while (!chazaId) {
    if (suffix > MAX_SLUG_ATTEMPTS) {
      return { ok: false, error: "No se pudo generar un slug único. Intenta con un nombre diferente." }
    }

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

  const resolvedId = chazaId

  // 6) Insertar las relaciones N:M con categorías (una fila por categoría en la
  //    tabla puente). Si esto falla, la chaza ya existe pero queda sin categorías;
  //    lo reportamos con un mensaje que sugiere editarla, en vez de dejar el error
  //    crudo de Postgres llegar al usuario.
  const joinRows = catRows.map((c: { id: string; slug: string }) => ({
    chaza_id: resolvedId,
    category_id: c.id,
  }))
  const { error: jErr } = await supabase.from("chaza_categories").insert(joinRows)
  if (jErr) {
    console.error("[publishChazaAction] chaza_categories", jErr.message)
    return { ok: false, error: "La chaza se creó pero no se pudieron asignar categorías. Intenta editarla." }
  }

  const productRows = data.products
    .filter((p) => p.name.trim())
    .map((p, i) => ({
      chaza_id: resolvedId,
      name: p.name.trim(),
      price_label: p.priceLabel.trim() || null,
      sort_order: i,
    }))

  // 7) Insertar productos (opcional). A diferencia de las categorías, un fallo aquí
  //    no aborta: la chaza es válida sin productos, así que solo lo registramos.
  if (productRows.length) {
    const { error: pErr } = await supabase.from("chaza_products").insert(productRows)
    if (pErr) console.error("[publishChazaAction] chaza_products", pErr.message)
  }

  // 8) Revalidar las páginas que muestran el catálogo. Next.js cachea los Server
  //    Components; sin esta invalidación, la chaza nueva no aparecería en explorar/
  //    mapa/etc. hasta el próximo build. revalidatePath fuerza el re-render.
  revalidatePath("/explorar")
  revalidatePath("/mapa")
  revalidatePath("/guardadas")
  revalidatePath("/recomendados")
  revalidatePath(`/chazas/${slug}`)

  return { ok: true, slug, id: chazaId }
}

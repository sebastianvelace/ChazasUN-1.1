"use server"

import {
  detectImageMimeFromBuffer,
  isAllowedCoverMimeType,
  normalizeCoverMimeType,
} from "@/lib/security/image-magic-bytes"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"
import { createServerSupabaseClient } from "@/lib/supabase/server"

const BUCKET = "chaza-covers"
const MAX_BYTES = 5 * 1024 * 1024

export type UploadCoverResult = { ok: true; url: string } | { ok: false; error: string }

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "cover.jpg"
}

export async function uploadChazaCoverAction(formData: FormData): Promise<UploadCoverResult> {
  if (!getSupabaseBrowserEnv()) {
    return { ok: false, error: "Supabase no configurado." }
  }

  const file = formData.get("file")
  if (!file || !(file instanceof File)) {
    return { ok: false, error: "Archivo no valido." }
  }
  if (!isAllowedCoverMimeType(file.type)) {
    return { ok: false, error: "Solo imagenes (JPEG, PNG, WebP, GIF)." }
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Imagen demasiado grande (max 5 MB)." }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const detectedMime = detectImageMimeFromBuffer(buffer)
  if (
    !detectedMime ||
    normalizeCoverMimeType(detectedMime) !== normalizeCoverMimeType(file.type)
  ) {
    return { ok: false, error: "Archivo de imagen no valido o tipo no coincide." }
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: "Inicia sesion para subir la foto." }
  }

  const path = `${user.id}/${Date.now()}-${safeFileName(file.name)}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: detectedMime,
    upsert: false,
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { ok: true, url: pub.publicUrl }
}

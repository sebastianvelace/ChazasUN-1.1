/** Ruta relativa al detalle público de una chaza. */
export function chazaDetailPath(slug: string): string {
  return `/chazas/${slug}`
}

/**
 * URL absoluta al detalle. En el cliente usa `window.location.origin`.
 * En servidor (si hiciera falta) usa `NEXT_PUBLIC_SITE_URL` sin barra final.
 */
export function resolveChazaPublicUrl(slug: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}${chazaDetailPath(slug)}`
  }
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")
  if (base) return `${base}${chazaDetailPath(slug)}`
  return ""
}

export function buildShareMessage(chazaName: string, absoluteUrl: string): string {
  return `Mira "${chazaName}" en ChazasUN: ${absoluteUrl}`
}

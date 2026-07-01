import type { MetadataRoute } from "next"

const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3001"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Páginas personales, de administración o de API: no indexar.
      disallow: ["/admin", "/mis-chazas", "/guardadas", "/api/", "/auth/"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}

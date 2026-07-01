import type { MetadataRoute } from "next"
import { getAllBlogSlugs } from "@/lib/constants/blog-posts"

const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3001"

// Solo rutas públicas indexables. Se excluyen páginas personales/admin
// (guardadas, mis-chazas, admin, recomendados) — ver robots.ts.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes: { path: string; changeFrequency: "daily" | "weekly"; priority: number }[] = [
    { path: "", changeFrequency: "daily", priority: 1 },
    { path: "/explorar", changeFrequency: "daily", priority: 0.9 },
    { path: "/mapa", changeFrequency: "weekly", priority: 0.7 },
    { path: "/blog", changeFrequency: "weekly", priority: 0.6 },
    { path: "/publicar-chaza", changeFrequency: "weekly", priority: 0.7 },
    { path: "/terminos", changeFrequency: "weekly", priority: 0.3 },
    { path: "/privacidad", changeFrequency: "weekly", priority: 0.3 },
  ]

  const routeEntries: MetadataRoute.Sitemap = staticRoutes.map(({ path, changeFrequency, priority }) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))

  const blogEntries: MetadataRoute.Sitemap = getAllBlogSlugs().map(({ slug }) => ({
    url: `${base}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }))

  return [...routeEntries, ...blogEntries]
}

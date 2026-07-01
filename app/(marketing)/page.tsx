import {
  Navbar,
  HeroSection,
  CampusScrollSection,
  HowItWorksSection,
  Footer,
} from "@/components/landing"
import { ChazaSwiper } from "@/components/chazas"
import { CatalogLoadState } from "@/components/chazas/catalog-load-state"
import { getChazasAction } from "@/lib/actions/chazas"
import { getPublicStatsAction } from "@/lib/actions/stats"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [statsResult, chazasResult] = await Promise.allSettled([
    getPublicStatsAction(),
    getChazasAction(),
  ])
  const stats =
    statsResult.status === "fulfilled"
      ? statsResult.value
      : { chazasPublished: 0, reviewsPublished: 0 }
  const chazas = chazasResult.status === "fulfilled" ? chazasResult.value : null

  if (statsResult.status === "rejected") {
    console.error("[home] No fue posible cargar las estadísticas.", statsResult.reason)
  }
  if (chazasResult.status === "rejected") {
    console.error("[home] No fue posible cargar el catálogo.", chazasResult.reason)
  }

  // Datos estructurados (JSON-LD) para buscadores. Sin SearchAction porque no
  // existe un endpoint de búsqueda con query param real.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3001"
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "ChazasUN",
        url: siteUrl,
        logo: `${siteUrl}/opengraph-image`,
        description:
          "Marketplace de las chazas del campus de la Universidad Nacional de Colombia (sede Bogotá): comida, servicios, papelería y más, sin comisiones.",
        areaServed: "Universidad Nacional de Colombia, Bogotá",
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "ChazasUN",
        url: siteUrl,
        inLanguage: "es-CO",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
    ],
  }

  return (
    <div className="relative min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex flex-col">
        <HeroSection
          chazasPublished={stats.chazasPublished}
          reviewsPublished={stats.reviewsPublished}
          featuredImage={chazas?.[0]?.image}
        />
        <CampusScrollSection />
        {chazas ? (
          <ChazaSwiper sectionId="explorar" showViewAllLink items={chazas} />
        ) : (
          <CatalogLoadState />
        )}
        <HowItWorksSection />
      </main>
      <Footer />
    </div>
  )
}

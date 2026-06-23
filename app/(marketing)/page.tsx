import {
  Navbar,
  HeroSection,
  CampusScrollSection,
  CategoriesSection,
  HowItWorksSection,
  Footer,
} from "@/components/landing"
import { ChazaSwiper } from "@/components/chazas"
import { getChazasAction } from "@/lib/actions/chazas"
import { getPublicStatsAction } from "@/lib/actions/stats"

export default async function HomePage() {
  const [stats, chazas] = await Promise.all([getPublicStatsAction(), getChazasAction()])
  return (
    <div className="relative min-h-screen bg-white">
      <Navbar />
      <main className="flex flex-col">
        <HeroSection
          chazasPublished={stats.chazasPublished}
          reviewsPublished={stats.reviewsPublished}
          featuredImage={chazas[0]?.image}
        />
        <CampusScrollSection />
        <ChazaSwiper sectionId="explorar" showViewAllLink items={chazas} />
        <CategoriesSection />
        <HowItWorksSection />
      </main>
      <Footer />
    </div>
  )
}

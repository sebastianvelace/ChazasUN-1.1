import {
  Navbar,
  HeroSection,
  CategoriesSection,
  BlogSection,
  ReviewsSection,
  HowItWorksSection,
  Footer,
} from "@/components/landing"
import { ChazaSwiper } from "@/components/chazas"
import { getPublicStatsAction } from "@/lib/actions/stats"

export default async function HomePage() {
  const stats = await getPublicStatsAction()
  return (
    <div className="relative min-h-screen bg-white">
      <Navbar />
      <main className="flex flex-col">
        <HeroSection
          chazasPublished={stats.chazasPublished}
          reviewsPublished={stats.reviewsPublished}
        />
        <ChazaSwiper sectionId="explorar" showViewAllLink />
        <CategoriesSection />
        <HowItWorksSection />
        <ReviewsSection />
        <BlogSection />
      </main>
      <Footer />
    </div>
  )
}

import {
  Navbar,
  HeroSection,
  ChazaSwiper,
  CategoriesSection,
  BlogSection,
  ReviewsSection,
  HowItWorksSection,
  Footer,
} from "@/components/landing"

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white">
      {/* Sticky navigation */}
      <Navbar />

      {/* Main content */}
      <main className="flex flex-col">
        {/* Hero: rojo solido, texto claro, CTAs */}
        <HeroSection />

        {/* Swiper tipo Tinder con chazas de ejemplo */}
        <ChazaSwiper />

        {/* Todas las categorias de chazas */}
        <CategoriesSection />

        {/* Como funciona la plataforma */}
        <HowItWorksSection />

        {/* Comentarios y resenas de la comunidad */}
        <ReviewsSection />

        {/* Blog con noticias y consejos */}
        <BlogSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

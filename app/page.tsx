import {
  Navbar,
  HeroSection,
  ChazaSwiper,
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
        {/* Hero: rojo sólido, texto claro, CTAs */}
        <HeroSection />

        {/* Swiper tipo Tinder con chazas de ejemplo */}
        <ChazaSwiper />

        {/* Cómo funciona la plataforma */}
        <HowItWorksSection />

        {/* Comentarios y reseñas de la comunidad */}
        <ReviewsSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

import {
  WavyBackground,
  Navbar,
  HeroSection,
  ChazaSwiper,
  EssenceSection,
  HowItWorksSection,
  Footer,
} from "@/components/landing"

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white">
      {/* Wavy checkerboard background - fixed behind everything */}
      <WavyBackground />

      {/* Sticky navigation */}
      <Navbar />

      {/* Main content - positioned above background */}
      <main className="relative z-10 flex flex-col">
        <HeroSection />
        <ChazaSwiper />
        <EssenceSection />
        <HowItWorksSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

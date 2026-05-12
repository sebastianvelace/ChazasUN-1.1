import {
  WavyBackground,
  Navbar,
  HeroSection,
  EssenceSection,
  HowItWorksSection,
  Footer,
} from "@/components/landing"

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Wavy checkerboard background - fixed behind everything */}
      <WavyBackground />

      {/* Sticky navigation */}
      <Navbar />

      {/* Main content - positioned above background */}
      <main className="relative z-10 flex flex-col gap-8 sm:gap-12">
        <HeroSection />
        <EssenceSection />
        <HowItWorksSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

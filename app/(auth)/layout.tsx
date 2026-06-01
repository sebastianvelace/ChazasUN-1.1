import Link from "next/link"
import { SquiggleIcon } from "@/components/landing/squiggle-icon"

const stats = [
  { value: "14+", label: "Chazas activas" },
  { value: "4.8", label: "Calidad promedio" },
  { value: "UN", label: "Campus Bogotá" },
]

const testimonial = {
  quote: "Encontré mi chaza de tinto favorita en 10 segundos. No volvería a buscar de otra forma.",
  author: "Laura G. — Ing. de Sistemas",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* ── Panel izquierdo (rojo) — solo desktop ── */}
      <aside className="hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col relative overflow-hidden bg-brand-red">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,0.4) 39px,rgba(255,255,255,0.4) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,0.4) 39px,rgba(255,255,255,0.4) 40px)",
          }}
          aria-hidden="true"
        />
        {/* Floating blobs */}
        <div className="absolute top-16 right-16 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-float" aria-hidden="true" />
        <div className="absolute bottom-32 left-12 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} aria-hidden="true" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full px-12 py-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <SquiggleIcon width={48} height={24} className="text-white/80 transition-transform duration-300 group-hover:scale-105" />
            <span className="font-stencil text-2xl text-white tracking-wider">CHAZAS UN</span>
          </Link>

          {/* Center content */}
          <div>
            <p className="inline-block bg-white/20 text-white text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-8">
              Marketplace universitario
            </p>
            <h2 className="font-stencil text-7xl xl:text-8xl text-white leading-none mb-6">
              EL CAMPUS
              <br />
              <span className="text-white/60">EN TUS</span>
              <br />
              MANOS.
            </h2>
            <p className="text-white/70 text-lg leading-relaxed max-w-sm mb-12">
              Descubre chazas, conecta con emprendedores y apoya la economía estudiantil de la Universidad Nacional.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-10 border-t border-white/20 pt-8 mb-12">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="font-stencil text-3xl text-white">{s.value}</p>
                  <p className="text-white/50 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-5 border border-white/10 max-w-sm">
              <p className="text-white/90 text-sm leading-relaxed mb-3 italic">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <p className="text-white/50 text-xs font-semibold">{testimonial.author}</p>
            </div>
          </div>

          {/* Bottom */}
          <p className="text-white/30 text-xs">
            Proyecto estudiantil independiente — no afiliado a la Universidad Nacional.
          </p>
        </div>
      </aside>

      {/* ── Panel derecho (form) ── */}
      <div className="flex-1 flex flex-col min-h-screen bg-white">
        {/* Mobile header */}
        <header className="lg:hidden py-6 px-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-3">
            <SquiggleIcon width={40} height={20} className="text-brand-red" />
            <span className="font-stencil text-xl text-brand-red tracking-wider">CHAZAS UN</span>
          </Link>
        </header>

        {/* Desktop back link */}
        <div className="hidden lg:flex px-10 pt-8">
          <Link href="/" className="text-xs text-gray-400 hover:text-brand-red transition-colors flex items-center gap-1.5">
            <span>←</span> Volver al inicio
          </Link>
        </div>

        <main className="flex-1 flex items-center justify-center px-6 py-10 lg:px-12 xl:px-20">
          <div className="w-full max-w-md">{children}</div>
        </main>

        <footer className="hidden lg:block px-10 pb-8">
          <p className="text-xs text-gray-300">© 2026 ChazasUN</p>
        </footer>
      </div>
    </div>
  )
}

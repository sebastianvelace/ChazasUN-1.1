"use client"

import Link from "next/link"
import { SquiggleIcon } from "./squiggle-icon"
import { siteConfig } from "@/config/site"
import { useGSAPSafe } from "@/hooks/use-gsap-reduced"

export function Footer() {
  const footerRef = useGSAPSafe(({ isReduced, gsap }) => {
    if (isReduced) return

    gsap.from(".footer-content", {
      y: 32,
      duration: 0.7,
      ease: "power2.out",
      scrollTrigger: {
        trigger: footerRef.current,
        start: "top bottom",
        once: true,
      },
    })

    const blobs = footerRef.current?.querySelectorAll(".footer-blob")
    blobs?.forEach((blob, i) => {
      gsap.to(blob, {
        y: i % 2 === 0 ? -18 : 14,
        x: i % 2 === 0 ? 8 : -6,
        duration: 5 + i * 1.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: i * 0.8,
      })
    })
  })

  return (
    <footer ref={footerRef} id="contacto" className="relative bg-foreground text-primary-foreground w-full overflow-hidden">
      <div className="relative h-12 bg-background">
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 w-full" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 0 Q360 48 720 24 Q1080 0 1440 48 L1440 48 L0 48 Z" fill="var(--foreground)" />
        </svg>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="pt-16 pb-12 relative">
          <div className="footer-blob absolute top-[-60px] right-[-80px] w-[300px] h-[300px] rounded-full bg-brand-red/20 blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="footer-blob absolute bottom-[-40px] left-[-60px] w-[250px] h-[250px] rounded-full bg-muted-foreground/20 blur-3xl pointer-events-none" aria-hidden="true" />

          <div className="footer-content relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <SquiggleIcon width={48} height={24} className="text-brand-red" />
                <span className="font-display font-extrabold text-2xl text-white tracking-tight">CHAZAS UN</span>
              </div>
              <p className="text-muted-foreground text-base leading-relaxed max-w-xs font-medium mb-8">
                El marketplace de los estudiantes de la Universidad Nacional de Colombia.
                Gratuito para todos.
              </p>
              <Link
                href={siteConfig.urls.explorar}
                className="inline-flex items-center gap-2 rounded-full bg-brand-red px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-red-dark transition"
              >
                EXPLORAR CHAZAS
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Plataforma</p>
                <nav className="flex flex-col gap-3">
                  <Link href={siteConfig.urls.explorar} className="text-muted-foreground hover:text-white text-sm font-semibold transition-colors">Explorar chazas</Link>
                  <Link href={siteConfig.urls.mapa} className="text-muted-foreground hover:text-white text-sm font-semibold transition-colors">Mapa del campus</Link>
                  <Link href={siteConfig.urls.publicarChaza} className="text-muted-foreground hover:text-white text-sm font-semibold transition-colors">Publicar mi chaza</Link>
                </nav>
              </div>
              <div>
                <p className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Legal</p>
                <nav className="flex flex-col gap-3">
                  <Link href="/terminos" className="text-muted-foreground hover:text-white text-sm font-semibold transition-colors">Términos de uso</Link>
                  <Link href="/privacidad" className="text-muted-foreground hover:text-white text-sm font-semibold transition-colors">Privacidad</Link>
                  <Link href={siteConfig.urls.blog} className="text-muted-foreground hover:text-white text-sm font-semibold transition-colors">Blog</Link>
                </nav>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-muted-foreground text-xs">
            <p>© 2026 ChazasUN — Proyecto estudiantil independiente · UN Bogotá</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

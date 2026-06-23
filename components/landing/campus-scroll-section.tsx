"use client"

import Link from "next/link"
import { ArrowRight, MapPinned, MessageCircle, ScanLine } from "lucide-react"
import { useGSAPSafe } from "@/hooks/use-gsap-reduced"

const moments = [
  {
    label: "01",
    title: "Encuentra lo que necesitas antes de caminar.",
    body: "El feed empieza con chazas reales, fotos grandes y precios visibles. Menos búsqueda, más decisión.",
    stat: "1 swipe",
  },
  {
    label: "02",
    title: "Ubica el puesto en el mapa del campus.",
    body: "Cada chazero mueve su pin. La ubicación vive con el negocio y se puede corregir sin depender de un mapa estático.",
    stat: "pin vivo",
  },
  {
    label: "03",
    title: "Contacta por fuera, sin comisiones ni fricción.",
    body: "ChazasUN no intenta ser un chat ni procesar pagos: conecta rápido y deja que la venta pase donde ya ocurre.",
    stat: "$0 fee",
  },
]

export function CampusScrollSection() {
  const sectionRef = useGSAPSafe(({ isReduced, gsap }) => {
    if (isReduced) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".campus-scroll",
          start: "top top",
          end: "+=220%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      })

      tl.to(".campus-phone", { rotate: -2, y: -20, duration: 1 })
        .to(".campus-card-a", { xPercent: -72, yPercent: 26, rotate: -10, scale: 0.88, duration: 1 }, "<")
        .to(".campus-card-b", { xPercent: 64, yPercent: -18, rotate: 8, scale: 0.95, duration: 1 }, "<")
        .to(".campus-map-pin", { left: "67%", top: "39%", scale: 1.18, duration: 1 }, "<")
        .to(".campus-copy-track", { yPercent: -33.333, duration: 1 }, "<")
        .to(".campus-progress", { scaleX: 0.66, duration: 1 }, "<")
        .to(".campus-phone", { rotate: 3, y: -36, duration: 1 })
        .to(".campus-card-a", { xPercent: -24, yPercent: 74, rotate: -4, scale: 0.78, opacity: 0.82, duration: 1 }, "<")
        .to(".campus-card-b", { xPercent: 16, yPercent: -44, rotate: 5, scale: 1.02, duration: 1 }, "<")
        .to(".campus-map-pin", { left: "43%", top: "58%", scale: 1.28, duration: 1 }, "<")
        .to(".campus-copy-track", { yPercent: -66.666, duration: 1 }, "<")
        .to(".campus-progress", { scaleX: 1, duration: 1 }, "<")

      gsap.from(".campus-shell", {
        opacity: 0,
        y: 48,
        duration: 0.8,
        ease: "expo.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
          once: true,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  })

  return (
    <section ref={sectionRef} className="campus-scroll relative min-h-[100dvh] overflow-hidden bg-[#101010] px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, #A31E1E 0, transparent 34%), radial-gradient(circle at 80% 70%, #ffffff 0, transparent 24%)" }} aria-hidden="true" />
      <div className="campus-shell relative z-10 mx-auto grid min-h-[calc(100dvh-8rem)] max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative h-[360px] overflow-hidden sm:h-[420px] lg:h-[520px]">
          <div className="campus-copy-track flex h-[300%] flex-col">
            {moments.map((moment) => (
              <article key={moment.label} className="flex h-1/3 flex-col justify-center">
                <p className="mb-5 font-mono text-xs font-bold text-brand-red">{moment.label} / PRODUCTO</p>
                <h2 className="max-w-xl font-display text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl">
                  {moment.title}
                </h2>
                <p className="mt-5 max-w-lg text-base leading-relaxed text-white/62">{moment.body}</p>
                <p className="mt-8 w-fit rounded-full border border-white/15 px-4 py-2 font-display text-2xl font-black text-white">
                  {moment.stat}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="relative mx-auto h-[560px] w-full max-w-[560px]">
          <div className="campus-card-a absolute left-2 top-10 z-10 w-48 rounded-[1.5rem] border border-white/12 bg-white/10 p-4 shadow-2xl shadow-black/30 backdrop-blur">
            <ScanLine className="mb-8 h-6 w-6 text-brand-red" />
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">QR en puesto</p>
            <p className="mt-1 text-sm font-bold">Del mostrador al feed</p>
          </div>

          <div className="campus-card-b absolute right-0 top-16 z-10 w-52 rounded-[1.5rem] border border-white/12 bg-white p-4 text-foreground shadow-2xl shadow-black/30">
            <MessageCircle className="mb-8 h-6 w-6 text-brand-red" />
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Contacto</p>
            <p className="mt-1 text-sm font-bold">WhatsApp o Instagram</p>
          </div>

          <div className="campus-phone absolute left-1/2 top-1/2 z-20 h-[500px] w-[270px] -translate-x-1/2 -translate-y-1/2 rounded-[2.2rem] border border-white/20 bg-[#f7f7f2] p-3 text-foreground shadow-2xl shadow-black/40">
            <div className="h-full overflow-hidden rounded-[1.7rem] bg-white">
              <div className="relative h-52 bg-[#ecece5]">
                <div className="absolute inset-4 rounded-[1.2rem] border border-black/10 bg-[linear-gradient(135deg,#ffffff_0%,#dadad1_100%)]">
                  <div className="absolute left-[18%] top-[42%] h-12 w-32 rounded-full bg-black/10" />
                  <div className="absolute right-[12%] top-[22%] h-20 w-16 rounded-full bg-brand-red/15" />
                  <div className="absolute bottom-[18%] left-[46%] h-16 w-24 rounded-full bg-black/10" />
                  <span className="campus-map-pin absolute left-[24%] top-[52%] flex h-9 w-9 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full bg-brand-red text-white shadow-lg shadow-brand-red/30">
                    <MapPinned className="h-5 w-5" />
                  </span>
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-red">Chaza cerca</p>
                <h3 className="mt-2 font-stencil text-4xl leading-none text-foreground">Tinto + arepa</h3>
                <p className="mt-2 text-sm text-muted-foreground">Edificio 401 · abierto hasta las 4 PM</p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-[#f1f1eb] p-3">
                    <p className="text-xs text-muted-foreground">Desde</p>
                    <p className="font-bold">$2.500</p>
                  </div>
                  <div className="rounded-2xl bg-brand-red p-3 text-white">
                    <p className="text-xs text-white/70">Rating</p>
                    <p className="font-bold">4.8 ★</p>
                  </div>
                </div>
                <Link href="/explorar" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-bold text-white">
                  Probar feed
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-5 left-0 right-0 mx-auto h-1 max-w-xs overflow-hidden rounded-full bg-white/10">
          <div className="campus-progress h-full origin-left scale-x-[0.33] rounded-full bg-brand-red" />
        </div>
      </div>
    </section>
  )
}

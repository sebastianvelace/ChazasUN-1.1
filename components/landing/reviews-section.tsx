"use client"

import { useState } from "react"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { useGSAPSafe } from "@/hooks/use-gsap-reduced"

interface Review {
  id: number
  author: string
  faculty: string
  avatar: string
  rating: number
  comment: string
  chaza: string
  date: string
}

const reviews: Review[] = [
  {
    id: 1,
    author: "Laura Gomez",
    faculty: "Ingenieria de Sistemas",
    avatar: "LG",
    rating: 5,
    comment: "El Rincon del Tinto es lo mejor que le paso a mi vida universitaria. El tinto es increible y las arepas son gigantes. Llevo tres semestres yendo todos los dias.",
    chaza: "El Rincon del Tinto",
    date: "Hace 2 dias",
  },
  {
    id: 2,
    author: "Sebastian Torres",
    faculty: "Derecho",
    avatar: "ST",
    rating: 5,
    comment: "Fotocopias Express me salvo la vida en el parcial. Llegue a las 7:55am con un trabajo de 40 paginas y estaba listo en 10 minutos. ¡Son los mejores!",
    chaza: "Fotocopias Express",
    date: "Hace 5 dias",
  },
  {
    id: 3,
    author: "Valentina Ruiz",
    faculty: "Medicina",
    avatar: "VR",
    rating: 5,
    comment: "Don Empanada es una institucion de la UN. La empanada hawaiana es una obra maestra. No entiendo como la hacen a ese precio. Absolutamente recomendada.",
    chaza: "Don Empanada",
    date: "Hace 1 semana",
  },
  {
    id: 4,
    author: "Mateo Herrera",
    faculty: "Economia",
    avatar: "MH",
    rating: 4,
    comment: "Tech Repair UN me reparo la pantalla del portatil en un dia. Precio justo, garantia real y me avisaron en cada paso del proceso. Muy profesionales.",
    chaza: "Tech Repair UN",
    date: "Hace 2 semanas",
  },
  {
    id: 5,
    author: "Isabela Castro",
    faculty: "Arquitectura",
    avatar: "IC",
    rating: 5,
    comment: "Libreria El Saber encontro el libro de teoria del color que llevaba meses buscando. Ademas, a mitad de precio. Es un tesoro escondido en el campus.",
    chaza: "Libreria El Saber",
    date: "Hace 3 semanas",
  },
  {
    id: 6,
    author: "Felipe Mora",
    faculty: "Biologia",
    avatar: "FM",
    rating: 4,
    comment: "ChazasUN me cambio la forma de ver el campus. Antes pasaba por los puestos sin saber que ofrecian. Ahora conozco cada chaza y sus especialidades.",
    chaza: "Plataforma ChazasUN",
    date: "Hace 1 mes",
  },
]

const avatarColor: Record<string, string> = {
  LG: "bg-rose-500",
  ST: "bg-blue-500",
  VR: "bg-emerald-500",
  MH: "bg-amber-500",
  IC: "bg-violet-500",
  FM: "bg-cyan-500",
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />
      ))}
    </div>
  )
}

export function ReviewsSection() {
  const [page, setPage] = useState(0)
  const [animating, setAnimating] = useState(false)
  const perPage = 3
  const totalPages = Math.ceil(reviews.length / perPage)
  const visible = reviews.slice(page * perPage, page * perPage + perPage)

  const sectionRef = useGSAPSafe(({ isReduced, gsap, ScrollTrigger }) => {
    if (isReduced) return

    gsap.from(".reviews-header", {
      y: 28,
      duration: 0.6,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".reviews-header",
        start: "top bottom",
        once: true,
      },
    })

    gsap.from(".review-card", {
      y: 36,
      scale: 0.97,
      duration: 0.55,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom",
        once: true,
      },
    })

    gsap.from(".review-dots", {
      y: 14,
      duration: 0.4,
      delay: 0.4,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".review-dots",
        start: "top bottom",
        once: true,
      },
    })
  })

  const go = (next: number) => {
    if (animating) return
    setAnimating(true)
    setPage(next)
    setTimeout(() => setAnimating(false), 400)
  }

  return (
    <section ref={sectionRef} id="comentarios" className="py-20 sm:py-28 px-4 bg-background overflow-hidden">
      <div className="mx-auto max-w-6xl">

        <div className="reviews-header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8 mb-14">
          <div>
            <span className="inline-block bg-brand-red/10 text-brand-red text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
              Comunidad
            </span>
            <h2 className="font-display font-extrabold text-5xl md:text-6xl text-foreground tracking-tight">
              LO QUE<br className="hidden sm:block" /> DICEN
            </h2>
          </div>

          <div className="flex flex-col gap-4 sm:items-end">
            <p className="text-muted-foreground text-sm font-medium max-w-xs sm:text-right">
              Testimonios reales de la comunidad universitaria.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => go(Math.max(0, page - 1))}
                disabled={page === 0 || animating}
                className="w-11 h-11 rounded-full border border-border bg-background shadow-sm flex items-center justify-center text-muted-foreground
                           hover:border-brand-red hover:text-brand-red transition-all hover:-translate-x-0.5
                           disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:translate-x-0"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-bold text-sm text-muted-foreground min-w-[48px] text-center">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => go(Math.min(totalPages - 1, page + 1))}
                disabled={page === totalPages - 1 || animating}
                className="w-11 h-11 rounded-full border border-border bg-background shadow-sm flex items-center justify-center text-muted-foreground
                           hover:border-brand-red hover:text-brand-red transition-all hover:translate-x-0.5
                           disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:translate-x-0"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {visible.map((review, i) => (
            <article
              key={review.id}
              className="review-card group relative rounded-2xl border border-border bg-background p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-5"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <span className="font-display text-[72px] leading-none text-brand-red/[0.07] absolute top-4 right-6 select-none pointer-events-none" aria-hidden="true">
                &ldquo;
              </span>

              <StarRow rating={review.rating} />

              <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                &ldquo;{review.comment}&rdquo;
              </p>

              <span className="inline-block text-xs font-bold text-brand-red bg-brand-red/[0.08] px-3 py-1.5 rounded-full w-fit">
                {review.chaza}
              </span>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColor[review.avatar] ?? "bg-gray-400"}`} aria-hidden="true">
                  {review.avatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{review.author}</p>
                  <p className="text-muted-foreground text-xs">{review.faculty} · {review.date}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="review-dots flex justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              disabled={animating}
              className={`h-2 rounded-full transition-all duration-500 ${i === page ? "w-10 bg-brand-red" : "w-2 bg-border hover:bg-brand-red/40"}`}
              aria-label={`Página ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import { useState } from "react"
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

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

const colorMap: Record<string, string> = {
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
        <Star
          key={i}
          className={`w-4 h-4 transition-all duration-300 ${
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  )
}

export function ReviewsSection() {
  const [page, setPage] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const perPage = 3
  const totalPages = Math.ceil(reviews.length / perPage)
  const visible = reviews.slice(page * perPage, page * perPage + perPage)

  const { ref: sectionRef, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.15 })

  const changePage = (newPage: number) => {
    if (isAnimating) return
    setIsAnimating(true)
    setPage(newPage)
    setTimeout(() => setIsAnimating(false), 500)
  }

  return (
    <section 
      ref={sectionRef}
      id="comentarios" 
      className="py-20 px-4 bg-gray-50 overflow-hidden"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div 
          className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14 scroll-reveal-up ${isVisible ? "visible" : ""}`}
        >
          <div>
            <h2 className="font-stencil text-4xl sm:text-5xl text-brand-red tracking-wide mb-2">
              LO QUE DICEN
            </h2>
            <p className="text-gray-500 text-base">
              Testimonios reales de la comunidad universitaria.
            </p>
          </div>

          {/* Pagination controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => changePage(Math.max(0, page - 1))}
              disabled={page === 0 || isAnimating}
              className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-brand-red hover:text-brand-red transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-400 min-w-[50px] text-center">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => changePage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1 || isAnimating}
              className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-brand-red hover:text-brand-red transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Review grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visible.map((review, i) => (
            <article
              key={review.id}
              className={`bg-white rounded-3xl p-7 shadow-sm border border-gray-100 flex flex-col gap-4 hover-lift scroll-reveal-scale ${isVisible ? "visible" : ""}`}
              style={{ transitionDelay: `${i * 0.15}s` }}
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-brand-red/20 flex-shrink-0 animate-pulse-soft" style={{ animationDuration: "4s" }} aria-hidden="true" />

              {/* Comment */}
              <p className="text-gray-700 text-sm leading-relaxed flex-1">
                &ldquo;{review.comment}&rdquo;
              </p>

              {/* Stars */}
              <StarRow rating={review.rating} />

              {/* Chaza tag */}
              <span className="inline-block text-xs text-brand-red bg-brand-red/10 px-3 py-1 rounded-full w-fit hover:bg-brand-red hover:text-white transition-colors cursor-default">
                {review.chaza}
              </span>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 transition-transform hover:scale-110 ${
                    colorMap[review.avatar] ?? "bg-gray-400"
                  }`}
                  aria-hidden="true"
                >
                  {review.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{review.author}</p>
                  <p className="text-gray-400 text-xs">{review.faculty} &middot; {review.date}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Dot pagination */}
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => changePage(i)}
              disabled={isAnimating}
              className={`h-2 rounded-full transition-all duration-500 hover:bg-brand-red/60 ${
                i === page ? "w-8 bg-brand-red" : "w-2 bg-gray-300"
              }`}
              aria-label={`Pagina ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

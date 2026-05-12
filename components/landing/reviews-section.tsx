"use client"

import { useState } from "react"
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react"

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
    author: "Laura Gómez",
    faculty: "Ingeniería de Sistemas",
    avatar: "LG",
    rating: 5,
    comment: "El Rincón del Tinto es lo mejor que le pasó a mi vida universitaria. El tinto es increíble y las arepas son gigantes. Llevo tres semestres yendo todos los días.",
    chaza: "El Rincón del Tinto",
    date: "Hace 2 días",
  },
  {
    id: 2,
    author: "Sebastián Torres",
    faculty: "Derecho",
    avatar: "ST",
    rating: 5,
    comment: "Fotocopias Express me salvó la vida en el parcial. Llegué a las 7:55am con un trabajo de 40 páginas y estaba listo en 10 minutos. ¡Son los mejores!",
    chaza: "Fotocopias Express",
    date: "Hace 5 días",
  },
  {
    id: 3,
    author: "Valentina Ruiz",
    faculty: "Medicina",
    avatar: "VR",
    rating: 5,
    comment: "Don Empanada es una institución de la UN. La empanada hawaiana es una obra maestra. No entiendo cómo la hacen a ese precio. Absolutamente recomendada.",
    chaza: "Don Empanada",
    date: "Hace 1 semana",
  },
  {
    id: 4,
    author: "Mateo Herrera",
    faculty: "Economía",
    avatar: "MH",
    rating: 4,
    comment: "Tech Repair UN me reparó la pantalla del portátil en un día. Precio justo, garantía real y me avisaron en cada paso del proceso. Muy profesionales.",
    chaza: "Tech Repair UN",
    date: "Hace 2 semanas",
  },
  {
    id: 5,
    author: "Isabela Castro",
    faculty: "Arquitectura",
    avatar: "IC",
    rating: 5,
    comment: "Librería El Saber encontró el libro de teoría del color que llevaba meses buscando. Además, a mitad de precio. Es un tesoro escondido en el campus.",
    chaza: "Librería El Saber",
    date: "Hace 3 semanas",
  },
  {
    id: 6,
    author: "Felipe Mora",
    faculty: "Biología",
    avatar: "FM",
    rating: 4,
    comment: "ChazasUN me cambió la forma de ver el campus. Antes pasaba por los puestos sin saber qué ofrecían. Ahora conozco cada chaza y sus especialidades.",
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
          className={`w-4 h-4 ${
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
  const perPage = 3
  const totalPages = Math.ceil(reviews.length / perPage)
  const visible = reviews.slice(page * perPage, page * perPage + perPage)

  return (
    <section id="comentarios" className="py-20 px-4 bg-gray-50">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
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
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-brand-red hover:text-brand-red transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-400">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-brand-red hover:text-brand-red transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
              className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-brand-red/20 flex-shrink-0" aria-hidden="true" />

              {/* Comment */}
              <p className="text-gray-700 text-sm leading-relaxed flex-1">
                &ldquo;{review.comment}&rdquo;
              </p>

              {/* Stars */}
              <StarRow rating={review.rating} />

              {/* Chaza tag */}
              <span className="inline-block text-xs text-brand-red bg-brand-red/10 px-3 py-1 rounded-full w-fit">
                {review.chaza}
              </span>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
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
              onClick={() => setPage(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === page ? "w-8 bg-brand-red" : "w-2 bg-gray-300"
              }`}
              aria-label={`Página ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { Calendar, User, ArrowRight, Clock } from "lucide-react"

const blogPosts = [
  {
    id: 1,
    title: "5 tips para iniciar tu chaza en la Universidad",
    excerpt: "Consejos practicos para estudiantes emprendedores que quieren comenzar su negocio dentro del campus universitario.",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&h=400&fit=crop",
    author: "Maria Lopez",
    date: "15 Mar 2024",
    readTime: "5 min",
    category: "Emprendimiento",
  },
  {
    id: 2,
    title: "Las mejores chazas de comida segun los estudiantes",
    excerpt: "Ranking de las chazas mas populares basado en las reseñas de la comunidad. Descubre donde comen los estudiantes.",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
    author: "Carlos Ruiz",
    date: "10 Mar 2024",
    readTime: "4 min",
    category: "Recomendaciones",
  },
  {
    id: 3,
    title: "Historia de las chazas en la Universidad Nacional",
    excerpt: "Un recorrido por la tradicion de los pequeños negocios estudiantiles que han sido parte de la vida universitaria por decadas.",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop",
    author: "Ana Martinez",
    date: "5 Mar 2024",
    readTime: "7 min",
    category: "Historia",
  },
  {
    id: 4,
    title: "Como ahorrar dinero comprando en chazas",
    excerpt: "Guia practica para estudiantes sobre como maximizar tu presupuesto aprovechando los precios de las chazas del campus.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop",
    author: "Juan Perez",
    date: "1 Mar 2024",
    readTime: "3 min",
    category: "Tips",
  },
]

export function BlogSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.1 })

  return (
    <section 
      ref={ref}
      id="blog" 
      className="py-20 px-4 bg-white"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14 scroll-reveal-up ${isVisible ? "visible" : ""}`}>
          <div>
            <span className="inline-block bg-brand-red/10 text-brand-red text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              Blog
            </span>
            <h2 className="font-stencil text-4xl sm:text-5xl text-brand-red tracking-wide">
              NOTICIAS Y CONSEJOS
            </h2>
            <p className="text-gray-500 mt-3 max-w-md">
              Articulos, tips y historias de la comunidad universitaria.
            </p>
          </div>
          <a 
            href="#" 
            className="inline-flex items-center gap-2 font-stencil text-brand-red hover:gap-4 transition-all duration-300 group"
          >
            <span>VER TODOS</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Blog grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {blogPosts.map((post, index) => (
            <article
              key={post.id}
              className={`group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 scroll-reveal-up ${isVisible ? "visible" : ""}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Category badge */}
                <span className="absolute top-4 left-4 bg-white/90 text-brand-red text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                  {post.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-semibold text-gray-800 text-base leading-snug mb-2 group-hover:text-brand-red transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                  {post.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Read more hover overlay */}
              <div className="px-5 pb-5">
                <button className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-brand-red hover:text-brand-red hover:bg-brand-red/5 transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                  <span>Leer mas</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div className={`mt-16 bg-gradient-to-br from-brand-red to-brand-red-dark rounded-3xl p-8 sm:p-12 text-center scroll-reveal-scale stagger-4 ${isVisible ? "visible" : ""}`}>
          <h3 className="font-stencil text-2xl sm:text-3xl text-white mb-3 tracking-wide">
            MANTENTE INFORMADO
          </h3>
          <p className="text-white/80 mb-6 max-w-md mx-auto">
            Recibe las ultimas noticias, tips y recomendaciones de chazas directamente en tu correo.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="tu@email.com"
              className="flex-1 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-white/50 transition-colors"
            />
            <button
              type="submit"
              className="font-stencil bg-white text-brand-red px-6 py-3 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              SUSCRIBIRSE
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

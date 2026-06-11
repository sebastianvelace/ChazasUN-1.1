"use client"

import { useRef } from "react"
import Link from "next/link"
import { useGSAP } from "@gsap/react"
import { gsap } from "@/lib/gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { User, ArrowRight, Clock } from "lucide-react"
import { blogPosts } from "@/lib/constants/blog-posts"

gsap.registerPlugin(ScrollTrigger)

export function BlogSection() {
  const containerRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) return

    // Header section
    gsap.from(".blog-header", {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".blog-header",
        start: "top 85%",
        once: true,
      },
    })

    // Batch para las tarjetas del blog
    ScrollTrigger.batch(".blog-card", {
      onEnter: (elements) => {
        gsap.fromTo(
          elements,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.08,
            ease: "power2.out",
          }
        )
      },
      once: true,
      start: "top 88%",
    })

    // Newsletter CTA
    gsap.from(".blog-newsletter", {
      opacity: 0,
      scale: 0.98,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".blog-newsletter",
        start: "top 88%",
        once: true,
      },
    })
  }, { scope: containerRef })

  return (
    <section
      ref={containerRef}
      id="blog"
      className="py-20 px-4 bg-white"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="blog-header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
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
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-stencil text-brand-red hover:gap-4 transition-all duration-300 group"
          >
            <span>VER TODOS</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Blog grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="blog-card group block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2"
            >
              <article className="h-full flex flex-col">
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

              {/* Read more */}
              <div className="px-5 pb-5 mt-auto">
                <div className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 group-hover:border-brand-red group-hover:text-brand-red group-hover:bg-brand-red/5 transition-all duration-300 flex items-center justify-center gap-2">
                  <span>Leer mas</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div className="blog-newsletter mt-16 bg-gradient-to-br from-brand-red to-brand-red-dark rounded-3xl p-8 sm:p-12 text-center">
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

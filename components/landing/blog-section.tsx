"use client"

import Link from "next/link"
import { useGSAPSafe } from "@/hooks/use-gsap-reduced"
import { User, ArrowRight, Clock } from "lucide-react"
import { blogPosts } from "@/lib/constants/blog-posts"

export function BlogSection() {
  const containerRef = useGSAPSafe(({ isReduced, gsap, ScrollTrigger }) => {
    if (isReduced) return

    ScrollTrigger.batch(".blog-header", {
      onEnter: (els) => gsap.fromTo(els,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      ),
      once: true,
      start: "top bottom",
    })

    ScrollTrigger.batch(".blog-card", {
      onEnter: (elements) => gsap.fromTo(
        elements,
        { opacity: 0, y: 36 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.08, ease: "power2.out" }
      ),
      once: true,
      start: "top bottom",
    })

    ScrollTrigger.batch(".blog-newsletter", {
      onEnter: (els) => gsap.fromTo(els,
        { opacity: 0, y: 20, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power2.out" }
      ),
      once: true,
      start: "top bottom",
    })
  })

  return (
    <section ref={containerRef} id="blog" className="py-20 px-4 bg-muted">
      <div className="mx-auto max-w-6xl">
        <div className="blog-header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
          <div>
            <span className="inline-block bg-brand-red/10 text-brand-red text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              Blog
            </span>
            <h2 className="font-display font-extrabold text-5xl md:text-6xl text-foreground tracking-tight">
              BLOG
            </h2>
            <p className="text-muted-foreground mt-3 max-w-md">
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="blog-card group block rounded-2xl overflow-hidden border border-border bg-background shadow-sm hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2"
            >
              <article className="h-full flex flex-col">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="absolute top-4 left-4 rounded-full bg-brand-red/10 text-brand-red text-xs font-medium px-2.5 py-0.5">
                    {post.category}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-foreground text-base leading-snug mb-2 group-hover:text-brand-red transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 mt-auto">
                  <div className="w-full py-2.5 border border-border rounded-xl text-sm font-medium text-muted-foreground group-hover:border-brand-red group-hover:text-brand-red group-hover:bg-brand-red/5 transition-all duration-300 flex items-center justify-center gap-2">
                    <span>Leer mas</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        <div className="blog-newsletter mt-16 bg-foreground rounded-2xl p-8 sm:p-12 text-center">
          <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-primary-foreground mb-3 tracking-tight">
            MANTENTE INFORMADO
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Recibe las ultimas noticias, tips y recomendaciones de chazas directamente en tu correo.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="tu@email.com"
              className="flex-1 px-5 py-3 rounded-full border border-gray-700 bg-gray-900 text-white placeholder:text-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
            />
            <button
              type="submit"
              className="rounded-full bg-brand-red text-white px-6 py-3 font-semibold hover:bg-brand-red-dark transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              SUSCRIBIRSE
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

import Link from "next/link"
import { PageContainer, PageHeader } from "@/components/layout"
import { blogPosts } from "@/lib/constants/blog-posts"
import { Calendar, User, Clock } from "lucide-react"

export const metadata = {
  title: "Blog | ChazasUN",
}

export default function BlogPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Contenido"
        title="BLOG"
        description="Articulos estaticos sobre emprendimiento y vida en el campus."
      />
      <div className="grid gap-8 md:grid-cols-2">
        {blogPosts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
            <article className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow h-full">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.image}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute top-4 left-4 bg-white/90 text-brand-red text-xs font-semibold px-3 py-1 rounded-full">
                  {post.category}
                </span>
              </div>
              <div className="p-6">
                <h2 className="font-stencil text-xl text-brand-red mb-2 leading-snug group-hover:underline">
                  {post.title}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{post.excerpt}</p>
                <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {post.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readTime}
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
      <p className="text-center text-sm text-gray-400 mt-12">
        Tambien puedes ver esta seccion en el inicio:{" "}
        <a href="/#blog" className="text-brand-red hover:underline">
          ir al blog en la home
        </a>
        .
      </p>
    </PageContainer>
  )
}

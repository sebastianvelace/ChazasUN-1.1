import Link from "next/link"
import { notFound } from "next/navigation"
import { PageContainer } from "@/components/layout"
import { ArrowLeft, Calendar, Clock, User } from "lucide-react"
import { getBlogPostBySlug, getAllBlogSlugs } from "@/lib/constants/blog-posts"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllBlogSlugs()
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)
  if (!post) return { title: "Articulo | ChazasUN" }
  return { title: `${post.title} | ChazasUN`, description: post.excerpt }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)
  if (!post) notFound()

  return (
    <PageContainer size="md">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-red mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al blog
      </Link>

      <article>
        <span className="inline-block bg-brand-red/10 text-brand-red text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
          {post.category}
        </span>
        <h1 className="font-stencil text-3xl sm:text-4xl text-brand-red mb-4 leading-tight">{post.title}</h1>
        <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-8">
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

        <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden mb-10">
          <img src={post.image} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="prose prose-gray max-w-none text-gray-700 text-sm sm:text-base leading-relaxed space-y-4">
          {post.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </article>
    </PageContainer>
  )
}

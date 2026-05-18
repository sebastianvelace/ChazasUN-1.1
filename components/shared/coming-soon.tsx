import Link from "next/link"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"

interface ComingSoonProps {
  title: string
  description: string
  backHref?: string
  backLabel?: string
}

export function ComingSoon({
  title,
  description,
  backHref = "/explorar",
  backLabel = "Ir a explorar",
}: ComingSoonProps) {
  return (
    <PageContainer size="md">
      <PageHeader title={title} description={description} />
      <div className="rounded-3xl border border-gray-100 bg-gray-50 p-8 text-center">
        <p className="text-gray-600 mb-6">Esta seccion se conectara a Supabase en la siguiente fase de desarrollo.</p>
        <Link
          href={backHref}
          className="inline-block font-stencil bg-brand-red text-white px-6 py-3 rounded-full hover:bg-brand-red-dark transition-colors"
        >
          {backLabel}
        </Link>
      </div>
    </PageContainer>
  )
}

"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertTriangle, RotateCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface CatalogLoadStateProps {
  className?: string
  showHomeLink?: boolean
}

export function CatalogLoadState({ className, showHomeLink = false }: CatalogLoadStateProps) {
  const router = useRouter()

  return (
    <section
      className={cn(
        "mx-auto my-10 w-[min(100%-2rem,48rem)] rounded-[1.5rem] border border-gray-200 bg-white px-6 py-10 text-center shadow-sm sm:px-10",
        className
      )}
      role="alert"
    >
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-red/10 text-brand-red">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <h2 className="font-display text-2xl font-black text-foreground sm:text-3xl">
        No pudimos cargar las chazas
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
        El catálogo no está respondiendo en este momento. Reintenta en unos segundos.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => router.refresh()}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-red px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-red-dark"
        >
          <RotateCw className="h-4 w-4" />
          Reintentar
        </button>
        {showHomeLink ? (
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-gray-200 px-5 py-3 text-sm font-bold text-foreground transition hover:border-brand-red/30 hover:text-brand-red"
          >
            Volver al inicio
          </Link>
        ) : null}
      </div>
    </section>
  )
}

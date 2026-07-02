"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertTriangle, RotateCw, SearchX } from "lucide-react"
import { PageContainer } from "@/components/layout"

interface ChazaDetailStateProps {
  kind: "error" | "not-found"
}

export function ChazaDetailState({ kind }: ChazaDetailStateProps) {
  const router = useRouter()
  const isError = kind === "error"

  return (
    <PageContainer className="flex min-h-[60dvh] items-center justify-center">
      <section
        className="w-full max-w-xl rounded-[1.5rem] border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-10"
        role={isError ? "alert" : "status"}
      >
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-red/10 text-brand-red">
          {isError ? <AlertTriangle className="h-6 w-6" /> : <SearchX className="h-6 w-6" />}
        </span>
        <h1 className="font-display text-3xl font-black text-foreground">
          {isError ? "No pudimos cargar esta chaza" : "Esta chaza no está disponible"}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
          {isError
            ? "Tuvimos un problema al consultar el catálogo. Reintenta en unos segundos."
            : "Puede que haya cambiado de dirección, esté pausada o que el enlace no sea correcto."}
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          {isError ? (
            <button
              type="button"
              onClick={() => router.refresh()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-red px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-red-dark"
            >
              <RotateCw className="h-4 w-4" />
              Reintentar
            </button>
          ) : null}
          <Link
            href="/explorar"
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-foreground transition hover:border-brand-red/30 hover:text-brand-red"
          >
            Volver a explorar
          </Link>
        </div>
      </section>
    </PageContainer>
  )
}

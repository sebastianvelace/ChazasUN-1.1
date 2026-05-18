"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { analyzeMenuFromImageAction } from "@/lib/actions/menu-vision"
import { ProductListEditor } from "@/components/forms/product-list-editor"
import type { ChazaProductRow } from "@/lib/actions/chaza-products"

export function MenuVisionPicker({
  onApply,
  className,
}: {
  onApply: (products: ChazaProductRow[]) => void
  className?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState<ChazaProductRow[] | null>(null)

  const runFile = async (file: File | null) => {
    if (!file) return
    setBusy(true)
    const fd = new FormData()
    fd.append("file", file)
    const res = await analyzeMenuFromImageAction(fd)
    setBusy(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    if (!res.products.length) {
      toast.message("No detectamos productos. Prueba otra foto o completa a mano.")
    }
    setPreview(res.products)
  }

  const apply = () => {
    if (!preview?.length) return
    onApply(preview)
    toast.success("Sugerencias aplicadas a la carta. Revisa y guarda al final.")
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  const discard = () => {
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className={cn("rounded-2xl border border-violet-100 bg-violet-50/50 p-4 space-y-4", className)}>
      <p className="text-sm font-medium text-gray-800">Analizar foto de carta (IA)</p>
      <p className="text-xs text-gray-600">
        Sube una foto clara del menu. Revisa el resultado antes de publicar; la IA puede equivocarse.
      </p>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => void runFile(e.target.files?.[0] ?? null)} />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="font-stencil border-2 border-violet-600 text-violet-700 px-4 py-2 rounded-full text-sm hover:bg-violet-100 disabled:opacity-50"
      >
        {busy ? "ANALIZANDO..." : "ELEGIR FOTO"}
      </button>

      {preview && preview.length > 0 && (
        <div className="space-y-3 border-t border-violet-100 pt-4">
          <p className="text-xs font-semibold text-gray-700">Vista previa (editable)</p>
          <ProductListEditor value={preview} onChange={setPreview} />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={apply} className="font-stencil bg-violet-600 text-white px-4 py-2 rounded-full text-sm">
              APLICAR A LA CARTA
            </button>
            <button type="button" onClick={discard} className="text-sm text-gray-600 underline">
              Descartar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

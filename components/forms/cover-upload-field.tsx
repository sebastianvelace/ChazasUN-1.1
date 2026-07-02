"use client"

import { useCallback, useRef, useState } from "react"
import { ImagePlus, Loader2, Link2, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface CoverUploadFieldProps {
  value: string
  onChange: (url: string) => void
  onFile: (file: File) => void | Promise<void>
  uploading?: boolean
  error?: string
  showUrlFallback?: boolean
}

export function CoverUploadField({
  value,
  onChange,
  onFile,
  uploading = false,
  error,
  showUrlFallback = true,
}: CoverUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [showUrl, setShowUrl] = useState(false)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0]
      if (file) void onFile(file)
    },
    [onFile]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={cn(
          "relative rounded-2xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden",
          dragOver ? "border-brand-red bg-brand-red/5" : "border-gray-200 hover:border-brand-red/50 bg-gray-50",
          uploading && "pointer-events-none opacity-70"
        )}
      >
        {value ? (
          <div className="relative aspect-[4/3] max-h-64">
            <img src={value} alt="Vista previa de portada" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="opacity-0 hover:opacity-100 text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-full">
                Cambiar foto
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onChange("")
              }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-gray-600 hover:text-brand-red shadow-sm"
              aria-label="Quitar foto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            {uploading ? (
              <Loader2 className="w-8 h-8 text-brand-red animate-spin mb-3" />
            ) : (
              <ImagePlus className="w-8 h-8 text-gray-400 mb-3" />
            )}
            <p className="text-sm font-medium text-gray-700">
              {uploading ? "Subiendo foto…" : "Arrastra una foto o toca para elegir"}
            </p>
            <p className="text-xs text-gray-500 mt-1">JPEG, PNG, WebP o GIF. Máx. 5 MB</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {showUrlFallback && (
        <div>
          {!showUrl ? (
            <button
              type="button"
              onClick={() => setShowUrl(true)}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-red transition-colors"
            >
              <Link2 className="w-3.5 h-3.5" />
              Pegar URL en su lugar
            </button>
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">URL de imagen (opcional)</label>
              <input
                type="url"
                placeholder="https://..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
              />
            </div>
          )}
        </div>
      )}

      {error && <p className="text-red-600 text-xs">{error}</p>}
    </div>
  )
}

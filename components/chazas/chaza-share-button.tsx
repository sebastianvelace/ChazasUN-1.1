"use client"

import { useEffect, useState } from "react"
import QRCode from "qrcode"
import { Share2, Copy, Download } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { resolveChazaPublicUrl, buildShareMessage } from "@/lib/utils/chaza-public-url"

type Props = {
  slug: string
  chazaName: string
  className?: string
  /** En listados: solo icono y texto corto */
  variant?: "default" | "compact" | "icon"
}

async function copyText(text: string, okMessage: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(okMessage)
  } catch {
    toast.error("No se pudo copiar. Selecciona el texto manualmente.")
  }
}

export function ChazaShareButton({ slug, chazaName, className, variant = "default" }: Props) {
  const [open, setOpen] = useState(false)
  const [publicUrl, setPublicUrl] = useState("")
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [qrError, setQrError] = useState(false)

  useEffect(() => {
    if (!open) return
    setQrError(false)
    const url = resolveChazaPublicUrl(slug)
    setPublicUrl(url)
    setQrDataUrl(null)
    if (!url) {
      setQrError(true)
      return
    }
    void QRCode.toDataURL(url, { width: 240, margin: 2, color: { dark: "#1a1a1a", light: "#ffffff" } })
      .then(setQrDataUrl)
      .catch(() => {
        setQrError(true)
        toast.error("No se pudo generar el codigo QR.")
      })
  }, [open, slug])

  const shareText = publicUrl ? buildShareMessage(chazaName, publicUrl) : ""

  const downloadQr = () => {
    if (!qrDataUrl) return
    const a = document.createElement("a")
    a.href = qrDataUrl
    a.download = `chazasun-${slug}-qr.png`
    a.click()
    toast.success("QR descargado")
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          variant === "icon"
            ? "inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-brand-red shadow-sm transition hover:border-brand-red/30 hover:bg-brand-red/5"
            : variant === "compact"
              ? "text-sm font-semibold text-gray-600 hover:text-brand-red inline-flex items-center gap-1"
              : "inline-flex items-center justify-center gap-2 rounded-full border-2 border-brand-red/30 text-brand-red font-stencil text-sm px-5 py-2.5 hover:bg-brand-red/5 transition-colors",
          className
        )}
        aria-label="Compartir chaza"
      >
        <Share2 className={variant === "compact" ? "w-3.5 h-3.5" : "w-4 h-4"} />
        {variant === "icon" ? null : variant === "compact" ? "Compartir / QR" : "COMPARTIR"}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-stencil text-brand-red">Compartir chaza</DialogTitle>
            <DialogDescription>
              Enlace directo a tu ficha. Usalo en WhatsApp, Instagram o imprime el QR para el puesto.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {publicUrl.startsWith("http://localhost") && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                Estas en local: el QR y el enlace solo funcionan en tu maquina. Para compartir en
                campus despliega en Vercel y actualiza la URL (ver <code className="text-[10px]">docs/VERCEL_DEPLOY.md</code>).
              </p>
            )}

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Enlace</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={publicUrl}
                  className="flex-1 text-xs rounded-xl border border-gray-200 px-3 py-2 bg-gray-50 truncate"
                />
                <button
                  type="button"
                  onClick={() => publicUrl && copyText(publicUrl, "Enlace copiado")}
                  className="shrink-0 rounded-xl border border-gray-200 p-2 hover:bg-gray-50"
                  title="Copiar enlace"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Texto para redes</p>
              <textarea
                readOnly
                value={shareText}
                rows={3}
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2 bg-gray-50 resize-none"
              />
              <button
                type="button"
                onClick={() => shareText && copyText(shareText, "Texto copiado")}
                className="mt-2 text-sm text-brand-red font-semibold hover:underline inline-flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                Copiar texto
              </button>
            </div>

            <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider self-start">Codigo QR</p>
              {qrDataUrl && (
                <img src={qrDataUrl} alt="Código QR con el enlace a esta chaza" className="w-48 h-48 rounded-lg border border-gray-100" />
              )}
              {open && !qrDataUrl && !qrError && (
                <p className="text-sm text-gray-500">Generando QR…</p>
              )}
              {qrError && <p className="text-sm text-red-600">No disponible</p>}
              <button
                type="button"
                disabled={!qrDataUrl}
                onClick={downloadQr}
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-red hover:underline disabled:opacity-40"
              >
                <Download className="w-4 h-4" />
                Descargar PNG
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

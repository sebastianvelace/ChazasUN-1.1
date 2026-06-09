"use client"

import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { siteConfig } from "@/config/site"

export type AuthPromptReason = "like" | "save" | "comment"

const copy: Record<AuthPromptReason, { title: string; description: string }> = {
  like: {
    title: "Crea tu cuenta para guardar likes",
    description:
      "Puedes explorar y deslizar sin registrarte. Para que recordemos tus chazas favoritas y mostrarte recomendados, necesitas una cuenta.",
  },
  save: {
    title: "Crea tu cuenta para guardar chazas",
    description:
      "Las chazas guardadas apareceran en tu seccion personal. Explorar sigue siendo libre sin cuenta.",
  },
  comment: {
    title: "Crea tu cuenta para comentar",
    description: "Los comentarios requieren cuenta para mantener la comunidad segura.",
  },
}

interface AuthPromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reason: AuthPromptReason
  /** Path to redirect to after auth. Defaults to siteConfig.urls.explorar. */
  nextPath?: string
}

export function AuthPromptDialog({ open, onOpenChange, reason, nextPath }: AuthPromptDialogProps) {
  const { title, description } = copy[reason]
  const resolvedNext = encodeURIComponent(nextPath ?? siteConfig.urls.explorar)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-stencil text-brand-red text-xl tracking-wide">{title}</DialogTitle>
          <DialogDescription className="text-gray-600 leading-relaxed">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto px-4 py-2 text-sm text-gray-500 hover:text-gray-800"
          >
            Seguir explorando
          </button>
          <div className="flex flex-col items-center gap-1.5 w-full sm:w-auto">
            <Link
              href={`${siteConfig.urls.registro}?next=${resolvedNext}`}
              className="w-full sm:w-auto font-stencil text-center bg-brand-red text-white px-6 py-2.5 rounded-full hover:bg-brand-red-dark transition-colors"
              onClick={() => onOpenChange(false)}
            >
              CREAR CUENTA
            </Link>
            <Link
              href={`/login?next=${resolvedNext}`}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => onOpenChange(false)}
            >
              ¿Ya tienes cuenta? Entra
            </Link>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

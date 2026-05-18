"use client"

import { ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
  /** compact = texto mas pequeño para cards */
  size?: "default" | "compact"
}

/** Sello: el equipo de ChazasUN valido el puesto (no aval institucional). */
export function ChazaVerifiedBadge({ className, size = "default" }: Props) {
  return (
    <span
      title="Verificada por ChazasUN: el equipo reviso datos del puesto. No es aval de la universidad."
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-semibold",
        size === "compact" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1",
        className
      )}
    >
      <ShieldCheck className={size === "compact" ? "w-3 h-3 shrink-0" : "w-3.5 h-3.5 shrink-0"} aria-hidden />
      Verificada
    </span>
  )
}

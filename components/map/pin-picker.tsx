"use client"

import { useState } from "react"
import Image from "next/image"
import { campusConfig } from "@/config/campus"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

interface PinPickerProps {
  value: { x: number; y: number }
  onChange: (pos: { x: number; y: number }) => void
  className?: string
}

export function PinPicker({ value, onChange, className }: PinPickerProps) {
  const onPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * 100
    const y = ((e.clientY - r.top) / r.height) * 100
    onChange({ x: clamp(x, 2, 98), y: clamp(y, 2, 98) })
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm text-gray-600">
        Toca el mapa para colocar el pin de tu chaza (aproximado en el campus).
      </p>
      <div
        role="img"
        aria-label="Seleccionar posicion en el mapa del campus"
        className="relative w-full aspect-[4/3] max-h-72 rounded-2xl border border-gray-200 overflow-hidden cursor-crosshair touch-none select-none bg-gray-100"
        onPointerDown={onPointer}
        onPointerMove={(e) => {
          if (e.buttons !== 1 && e.pointerType !== "touch") return
          if (e.pressure > 0 || e.pointerType === "touch") onPointer(e)
        }}
      >
        <Image
          src={campusConfig.mapImageUrl}
          alt=""
          fill
          className="object-contain pointer-events-none"
          draggable={false}
        />
        <span
          className="absolute -translate-x-1/2 -translate-y-full z-10 pointer-events-none"
          style={{ left: `${value.x}%`, top: `${value.y}%` }}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-brand-red shadow-lg">
            <MapPin className="h-5 w-5 text-white" />
          </span>
        </span>
      </div>
      <p className="text-xs text-gray-400">
        Posicion: {value.x.toFixed(0)}%, {value.y.toFixed(0)}% · Ajustable al validar con datos reales.
      </p>
    </div>
  )
}

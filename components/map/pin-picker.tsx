"use client"

import { useCallback, useRef, useState } from "react"
import Image from "next/image"
import { campusConfig } from "@/config/campus"
import { MapPin, Minus, Plus, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

const MIN_SCALE = 1
const MAX_SCALE = 4
const DRAG_THRESHOLD = 6

interface PinPickerProps {
  value: { x: number; y: number }
  onChange: (pos: { x: number; y: number }) => void
  className?: string
}

export function PinPicker({ value, onChange, className }: PinPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map())
  const gestureRef = useRef<
    | { kind: "idle" }
    | { kind: "pending"; startX: number; startY: number; pointerId: number }
    | { kind: "pan"; startPanX: number; startPanY: number; startX: number; startY: number }
    | { kind: "pinch"; startScale: number; startDist: number; startPanX: number; startPanY: number; midX: number; midY: number }
  >({ kind: "idle" })

  const resetView = useCallback(() => {
    setScale(1)
    setPan({ x: 0, y: 0 })
  }, [])

  const placePin = useCallback(
    (clientX: number, clientY: number) => {
      const el = containerRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const localX = (clientX - r.left - pan.x) / scale
      const localY = (clientY - r.top - pan.y) / scale
      const x = (localX / r.width) * 100
      const y = (localY / r.height) * 100
      onChange({ x: clamp(x, 2, 98), y: clamp(y, 2, 98) })
    },
    [onChange, pan.x, pan.y, scale]
  )

  const zoomAt = useCallback(
    (clientX: number, clientY: number, nextScale: number) => {
      const el = containerRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const mx = clientX - r.left
      const my = clientY - r.top
      const clamped = clamp(nextScale, MIN_SCALE, MAX_SCALE)

      if (clamped === MIN_SCALE) {
        setScale(MIN_SCALE)
        setPan({ x: 0, y: 0 })
        return
      }

      const ratio = clamped / scale
      setPan({
        x: mx - ratio * (mx - pan.x),
        y: my - ratio * (my - pan.y),
      })
      setScale(clamped)
    },
    [pan.x, pan.y, scale]
  )

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      zoomAt(e.clientX, e.clientY, scale * delta)
    },
    [scale, zoomAt]
  )

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointersRef.current.size === 2) {
      const pts = [...pointersRef.current.values()]
      const dx = pts[1].x - pts[0].x
      const dy = pts[1].y - pts[0].y
      gestureRef.current = {
        kind: "pinch",
        startScale: scale,
        startDist: Math.hypot(dx, dy) || 1,
        startPanX: pan.x,
        startPanY: pan.y,
        midX: (pts[0].x + pts[1].x) / 2,
        midY: (pts[0].y + pts[1].y) / 2,
      }
      return
    }

    if (pointersRef.current.size === 1) {
      gestureRef.current = {
        kind: "pending",
        startX: e.clientX,
        startY: e.clientY,
        pointerId: e.pointerId,
      }
    }
  }, [pan.x, pan.y, scale])

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!pointersRef.current.has(e.pointerId)) return
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      const g = gestureRef.current

      if (g.kind === "pinch" && pointersRef.current.size >= 2) {
        const pts = [...pointersRef.current.values()]
        const dx = pts[1].x - pts[0].x
        const dy = pts[1].y - pts[0].y
        const dist = Math.hypot(dx, dy) || 1
        const nextScale = clamp(g.startScale * (dist / g.startDist), MIN_SCALE, MAX_SCALE)
        zoomAt(g.midX, g.midY, nextScale)
        return
      }

      if (g.kind === "pending" && e.pointerId === g.pointerId) {
        const dx = e.clientX - g.startX
        const dy = e.clientY - g.startY
        if (Math.hypot(dx, dy) >= DRAG_THRESHOLD) {
          if (scale > 1) {
            gestureRef.current = {
              kind: "pan",
              startPanX: pan.x,
              startPanY: pan.y,
              startX: g.startX,
              startY: g.startY,
            }
          }
        }
      }

      if (g.kind === "pan") {
        setPan({
          x: g.startPanX + (e.clientX - g.startX),
          y: g.startPanY + (e.clientY - g.startY),
        })
      }
    },
    [pan.x, pan.y, scale, zoomAt]
  )

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      pointersRef.current.delete(e.pointerId)
      const g = gestureRef.current

      if (g.kind === "pending" && e.pointerId === g.pointerId && pointersRef.current.size === 0) {
        placePin(e.clientX, e.clientY)
      }

      if (pointersRef.current.size === 0) {
        gestureRef.current = { kind: "idle" }
      } else if (pointersRef.current.size === 1) {
        const remaining = [...pointersRef.current.entries()][0]
        gestureRef.current = {
          kind: "pending",
          startX: remaining[1].x,
          startY: remaining[1].y,
          pointerId: remaining[0],
        }
      }
    },
    [placePin]
  )

  const zoomFromCenter = useCallback(
    (factor: number) => {
      const el = containerRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      zoomAt(r.left + r.width / 2, r.top + r.height / 2, scale * factor)
    },
    [scale, zoomAt]
  )

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm text-gray-600">
        Toca el mapa para colocar el pin. Usa rueda o pellizco para acercar; arrastra para mover cuando estas
        ampliado.
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => zoomFromCenter(1.2)}
          className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:border-brand-red hover:text-brand-red transition-colors"
          aria-label="Acercar"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => zoomFromCenter(1 / 1.2)}
          className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:border-brand-red hover:text-brand-red transition-colors"
          aria-label="Alejar"
        >
          <Minus className="w-4 h-4" />
        </button>
        {scale > 1 && (
          <button
            type="button"
            onClick={resetView}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:border-brand-red hover:text-brand-red transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer
          </button>
        )}
        <span className="text-xs text-gray-400 ml-auto">{Math.round(scale * 100)}%</span>
      </div>

      <div
        ref={containerRef}
        role="img"
        aria-label="Seleccionar posicion en el mapa del campus"
        className="relative w-full aspect-[4/3] min-h-[320px] sm:min-h-[420px] rounded-2xl border border-gray-200 overflow-hidden cursor-crosshair touch-none select-none bg-gray-100"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="absolute inset-0 origin-top-left will-change-transform"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}
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
      </div>
      <p className="text-xs text-gray-400">
        Posicion: {value.x.toFixed(0)}%, {value.y.toFixed(0)}% · Ajustable al validar con datos reales.
      </p>
    </div>
  )
}

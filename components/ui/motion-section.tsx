"use client"

import type { ReactNode } from "react"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { cn } from "@/lib/utils"

type RevealVariant = "up" | "scale" | "fade"

const variantClass: Record<RevealVariant, string> = {
  up: "scroll-reveal-up",
  scale: "scroll-reveal-scale",
  fade: "scroll-reveal",
}

interface MotionSectionProps {
  children: ReactNode
  className?: string
  variant?: RevealVariant
}

/** Scroll-reveal wrapper with minimal fade/slide-up. */
export function MotionSection({ children, className, variant = "up" }: MotionSectionProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.08 })

  return (
    <div ref={ref} className={cn(variantClass[variant], isVisible && "visible", className)}>
      {children}
    </div>
  )
}

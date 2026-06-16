"use client"

import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  const { ref, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.2 })

  return (
    <header
      ref={ref}
      className={cn("mb-10 text-center sm:text-left scroll-reveal-up", isVisible && "visible")}
    >
      {eyebrow && (
        <span className="inline-block bg-brand-red/10 text-brand-red text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
          {eyebrow}
        </span>
      )}
      <h1 className="font-stencil text-4xl sm:text-5xl text-brand-red tracking-wide mb-3">{title}</h1>
      {description && <p className="text-muted-foreground max-w-2xl leading-relaxed">{description}</p>}
    </header>
  )
}

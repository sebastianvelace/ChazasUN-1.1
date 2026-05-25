"use client"

import { useEffect, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

export function AuthPageShell({ children, className }: { children: ReactNode; className?: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  return (
    <div
      className={cn(
        "motion-enter w-full",
        visible && "is-visible",
        className
      )}
    >
      {children}
    </div>
  )
}

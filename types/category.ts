import type { LucideIcon } from "lucide-react"

export interface Category {
  id: string
  slug: string
  name: string
  icon: LucideIcon
  colorClass: string
  chazaCount?: number
}

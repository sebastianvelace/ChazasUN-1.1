import {
  Coffee,
  UtensilsCrossed,
  Printer,
  Book,
  Smartphone,
  Scissors,
  ShoppingBag,
  Palette,
  Dumbbell,
  Music,
  Camera,
  Bike,
  Wrench,
} from "lucide-react"
import type { Category } from "@/types/category"

export const categories: Category[] = [
  { id: "cafe-bebidas", slug: "cafe-bebidas", name: "Cafe y Bebidas", icon: Coffee, colorClass: "bg-amber-500" },
  { id: "comida", slug: "comida", name: "Comida", icon: UtensilsCrossed, colorClass: "bg-orange-500" },
  { id: "servicios", slug: "servicios", name: "Servicios", icon: Wrench, colorClass: "bg-slate-500" },
  { id: "papeleria", slug: "papeleria", name: "Papeleria", icon: Printer, colorClass: "bg-blue-500" },
  { id: "libros", slug: "libros", name: "Libros", icon: Book, colorClass: "bg-emerald-500" },
  { id: "tecnologia", slug: "tecnologia", name: "Tecnologia", icon: Smartphone, colorClass: "bg-purple-500" },
  { id: "belleza", slug: "belleza", name: "Belleza", icon: Scissors, colorClass: "bg-pink-500" },
  { id: "ropa-accesorios", slug: "ropa-accesorios", name: "Ropa y Accesorios", icon: ShoppingBag, colorClass: "bg-rose-500" },
  { id: "arte-manualidades", slug: "arte-manualidades", name: "Arte y Manualidades", icon: Palette, colorClass: "bg-indigo-500" },
  { id: "deportes", slug: "deportes", name: "Deportes", icon: Dumbbell, colorClass: "bg-green-500" },
  { id: "musica", slug: "musica", name: "Musica", icon: Music, colorClass: "bg-violet-500" },
  { id: "fotografia", slug: "fotografia", name: "Fotografia", icon: Camera, colorClass: "bg-cyan-500" },
  { id: "transporte", slug: "transporte", name: "Transporte", icon: Bike, colorClass: "bg-teal-500" },
]

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug)
}

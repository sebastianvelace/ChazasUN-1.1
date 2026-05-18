import { mockChazaCards } from "@/lib/constants/mock-chazas"
import type { Review } from "@/types/review"

/** Reseñas semilla por id de chaza (demo). */
export const mockSeedReviews: Review[] = [
  {
    id: "seed-r-1",
    chazaId: "1",
    authorId: "seed",
    authorDisplayName: "Laura M.",
    rating: 5,
    body: "El tinto de la mañana no puede faltar. Rapido y sabroso.",
    status: "published",
    createdAt: "2024-03-01T12:00:00.000Z",
  },
  {
    id: "seed-r-2",
    chazaId: "1",
    authorId: "seed",
    authorDisplayName: "Andres P.",
    rating: 4,
    body: "Buen precio y el desayuno completo. A veces hay fila.",
    status: "published",
    createdAt: "2024-03-02T15:30:00.000Z",
  },
  {
    id: "seed-r-3",
    chazaId: "3",
    authorId: "seed",
    authorDisplayName: "Valentina",
    rating: 5,
    body: "Las empanadas son enormes. La hawaiana es mi favorita.",
    status: "published",
    createdAt: "2024-03-05T10:00:00.000Z",
  },
  {
    id: "seed-r-4",
    chazaId: "5",
    authorId: "seed",
    authorDisplayName: "Julian",
    rating: 5,
    body: "Consegui un texto que no estaba en la biblioteca. Muy amables.",
    status: "published",
    createdAt: "2024-03-07T09:20:00.000Z",
  },
  {
    id: "seed-r-5",
    chazaId: "4",
    authorId: "seed",
    authorDisplayName: "Camilo R.",
    rating: 4,
    body: "Me cambiaron la bateria el mismo dia. Precio justo.",
    status: "published",
    createdAt: "2024-03-08T11:45:00.000Z",
  },
]

/** Coincide semillas mock (ids "1","2",…) cuando la tarjeta viene de Supabase (uuid) por slug. */
export function getSeedReviewsForChazaCard(chaza: { id: string; slug: string }): Review[] {
  const ids = new Set<string>([chaza.id])
  const legacy = mockChazaCards.find((c) => c.slug === chaza.slug)
  if (legacy) ids.add(legacy.id)
  return mockSeedReviews
    .filter((r) => ids.has(r.chazaId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getSeedReviewsForChaza(chazaId: string): Review[] {
  return mockSeedReviews
    .filter((r) => r.chazaId === chazaId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

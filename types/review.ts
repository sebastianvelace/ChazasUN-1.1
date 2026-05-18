export type ReviewStatus = "published" | "hidden" | "pending"

export interface Review {
  id: string
  chazaId: string
  authorId: string
  authorDisplayName: string
  faculty?: string
  rating: number
  body: string
  status: ReviewStatus
  createdAt: string
}

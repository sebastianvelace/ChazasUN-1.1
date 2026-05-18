import { z } from "zod"

export const reviewSchema = z.object({
  chazaId: z.string().uuid().or(z.string().min(1)),
  rating: z.number().int().min(1).max(5),
  body: z
    .string()
    .min(10, "El comentario debe tener al menos 10 caracteres")
    .max(1000, "Maximo 1000 caracteres"),
})

export type ReviewInput = z.infer<typeof reviewSchema>

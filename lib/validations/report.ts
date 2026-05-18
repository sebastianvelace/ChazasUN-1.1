import { z } from "zod"

export const reportInputSchema = z.object({
  targetType: z.enum(["chaza", "review"]),
  targetId: z.string().uuid("Identificador invalido"),
  reason: z.string().min(3, "Indica un motivo").max(200),
  details: z.string().max(2000).optional(),
})

export type ReportInput = z.infer<typeof reportInputSchema>

import { z } from "zod"

/** Acepta URL http(s), data: (preview local) o vacio para placeholder. */
const coverUrlSchema = z
  .string()
  .max(8000)
  .refine(
    (s) =>
      s === "" ||
      /^https?:\/\//i.test(s) ||
      /^data:image\/(png|jpeg|jpg|gif|webp);base64,/i.test(s),
    "Imagen: URL valida, archivo pequeño o deja vacio"
  )

export const productRowSchema = z.object({
  name: z.string().min(1).max(80),
  priceLabel: z.string().max(30),
})

export const productsListSchema = z.array(productRowSchema).max(50)

export type ProductRowInput = z.infer<typeof productRowSchema>

export const replaceProductsInputSchema = z.object({
  products: productsListSchema,
})

export type ReplaceProductsInput = z.infer<typeof replaceProductsInputSchema>

export const publishChazaSchema = z.object({
  name: z.string().min(2, "Minimo 2 caracteres").max(80),
  description: z.string().min(20, "Cuenta un poco mas (min 20 caracteres)").max(800),
  coverImageUrl: coverUrlSchema,
  categorySlugs: z.array(z.string()).min(1, "Elige al menos una categoria"),
  locationText: z.string().min(5, "Describe donde encontrarte").max(120),
  schedule: z.string().min(3, "Horario aproximado").max(80),
  whatsapp: z.string().max(40).optional(),
  instagram: z.string().max(60).optional(),
  mapPosition: z.object({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
  }),
  products: z.array(productRowSchema),
})

export type PublishChazaInput = z.infer<typeof publishChazaSchema>

export const updateChazaSchema = z.object({
  name: z.string().min(2, "Minimo 2 caracteres").max(80),
  description: z.string().min(20, "Cuenta un poco mas (min 20 caracteres)").max(800),
  locationText: z.string().min(5).max(120),
  schedule: z.string().min(3).max(80),
  whatsapp: z.string().max(40).optional(),
  instagram: z.string().max(60).optional(),
  mapPosition: z.object({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
  }),
  status: z.enum(["draft", "published", "paused"]),
})

export type UpdateChazaInput = z.infer<typeof updateChazaSchema>

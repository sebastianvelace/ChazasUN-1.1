import { z } from "zod"

export const registerSchema = z.object({
  displayName: z.string().min(2, "Minimo 2 caracteres").max(60),
  email: z.string().email("Correo invalido"),
  password: z.string().min(6, "Minimo 6 caracteres"),
})

export const loginSchema = z.object({
  email: z.string().email("Correo invalido"),
  password: z.string().min(1, "Ingresa tu contrasena"),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email("Correo invalido"),
})

export const updatePasswordSchema = z
  .object({
    password: z.string().min(6, "Minimo 6 caracteres"),
    confirm: z.string().min(1, "Confirma la contrasena"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Las contrasenas no coinciden",
    path: ["confirm"],
  })

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>

"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { toast } from "sonner"
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth"
import { siteConfig } from "@/config/site"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"

export function RecuperarContrasenaForm() {
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
    const email = data.email.trim().toLowerCase()
    const env = getSupabaseBrowserEnv()
    if (!env) {
      toast.error("Supabase no esta configurado en este entorno.")
      return
    }

    try {
      const supabase = createBrowserSupabaseClient()
      const next = encodeURIComponent(siteConfig.urls.restablecerContrasena)
      const redirectTo = `${window.location.origin}/auth/callback?next=${next}`
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (error) {
        toast.error(error.message)
        return
      }
      toast.success("Si existe una cuenta con ese correo, te enviamos un enlace para restablecer la contrasena.")
      form.reset()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al enviar el correo")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Correo de tu cuenta
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-red-600 text-xs mt-1">{form.formState.errors.email.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="w-full font-stencil bg-brand-red text-white py-3 rounded-full hover:bg-brand-red-dark transition-colors disabled:opacity-60"
      >
        ENVIAR ENLACE
      </button>
      <p className="text-xs text-gray-500 text-center">
        Revisa spam. El enlace abrira ChazasUN para que elijas una contrasena nueva.
      </p>
      <div className="text-center">
        <Link href={siteConfig.urls.login} className="text-sm text-brand-red hover:underline">
          Volver a entrar
        </Link>
      </div>
    </form>
  )
}

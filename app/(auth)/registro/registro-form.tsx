"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button"
import { registerSchema, type RegisterInput } from "@/lib/validations/auth"
import { setMockSession } from "@/lib/auth/mock-session"
import { siteConfig } from "@/config/site"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"

export function RegistroForm() {
  const router = useRouter()
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: "", email: "", password: "" },
  })

  const onSubmit = async (data: RegisterInput) => {
    const email = data.email.trim().toLowerCase()
    const env = getSupabaseBrowserEnv()

    if (!env) {
      const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      setMockSession({
        id,
        email,
        displayName: data.displayName.trim(),
      })
      router.push(siteConfig.urls.explorar)
      router.refresh()
      return
    }

    try {
      const supabase = createBrowserSupabaseClient()
      const redirectTo = `${window.location.origin}/auth/callback?next=/explorar`
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password: data.password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            display_name: data.displayName.trim(),
          },
        },
      })

      if (error) {
        const msg =
          error.message === "Email logins are disabled" ||
          error.message.includes("Email signups are disabled")
            ? "Registro con correo desactivado en Supabase. Authentication → Providers → Email → activar."
            : error.message
        toast.error(msg)
        return
      }

      if (signUpData.session) {
        toast.success("Cuenta creada. Bienvenido.")
        router.push(siteConfig.urls.explorar)
        router.refresh()
        return
      }

      toast.success("Revisa tu correo y abre el enlace para confirmar la cuenta.")
      router.push(siteConfig.urls.login)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al registrarse")
    }
  }

  return (
    <div className="space-y-5">
      <GoogleOAuthButton label="Registrarse con Google" />
      {getSupabaseBrowserEnv() ? (
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wide">
            <span className="bg-white px-3 text-gray-400">o con correo</span>
          </div>
        </div>
      ) : null}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre para mostrar
        </label>
        <input
          id="displayName"
          type="text"
          autoComplete="nickname"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
          {...form.register("displayName")}
        />
        {form.formState.errors.displayName && (
          <p className="text-red-600 text-xs mt-1">{form.formState.errors.displayName.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Correo
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
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Contrasena
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p className="text-red-600 text-xs mt-1">{form.formState.errors.password.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="w-full font-stencil bg-brand-red text-white py-3 rounded-full hover:bg-brand-red-dark transition-colors disabled:opacity-60"
      >
        CREAR CUENTA
      </button>
      <p className="text-xs text-gray-400 text-center">
        {getSupabaseBrowserEnv()
          ? "Supabase puede enviar un correo de confirmacion segun la configuracion del proyecto."
          : "Sin Supabase: cuenta solo en este navegador (demo)."}
      </p>
      <div className="text-center">
        <Link href={siteConfig.urls.login} className="text-sm text-brand-red hover:underline">
          Ya tengo cuenta
        </Link>
      </div>
      </form>
    </div>
  )
}

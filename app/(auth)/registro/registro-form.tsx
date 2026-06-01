"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button"
import { registerSchema, type RegisterInput } from "@/lib/validations/auth"
import { setMockSession } from "@/lib/auth/mock-session"
import { siteConfig } from "@/config/site"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { safeNextPath } from "@/lib/security/safe-redirect"

export function RegistroForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = safeNextPath(searchParams.get("next"))
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
      router.push(nextPath)
      router.refresh()
      return
    }

    try {
      const supabase = createBrowserSupabaseClient()
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
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
        router.push(nextPath)
        router.refresh()
        return
      }

      toast.success("Revisa tu correo y abre el enlace para confirmar la cuenta.")
      router.push(`${siteConfig.urls.login}?next=${encodeURIComponent(nextPath)}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al registrarse")
    }
  }

  return (
    <div className="space-y-5">
      <GoogleOAuthButton label="Registrarse con Google" nextPath={nextPath} />
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

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="displayName" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
          Nombre para mostrar
        </label>
        <input
          id="displayName"
          type="text"
          autoComplete="nickname"
          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-sm font-medium
                     focus:border-brand-red focus:ring-2 focus:ring-brand-red/15 focus:bg-white outline-none
                     transition-all duration-200 placeholder:text-gray-300"
          placeholder="Tu nombre en la plataforma"
          {...form.register("displayName")}
        />
        {form.formState.errors.displayName && (
          <p className="text-red-500 text-xs mt-1.5 font-medium form-error-in">{form.formState.errors.displayName.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-sm font-medium
                     focus:border-brand-red focus:ring-2 focus:ring-brand-red/15 focus:bg-white outline-none
                     transition-all duration-200 placeholder:text-gray-300"
          placeholder="tu@correo.com"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-red-500 text-xs mt-1.5 font-medium form-error-in">{form.formState.errors.email.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="password" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-sm font-medium
                     focus:border-brand-red focus:ring-2 focus:ring-brand-red/15 focus:bg-white outline-none
                     transition-all duration-200 placeholder:text-gray-300"
          placeholder="Mínimo 8 caracteres"
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p className="text-red-500 text-xs mt-1.5 font-medium form-error-in">{form.formState.errors.password.message}</p>
        )}
      </div>

      {/* Fitts: botón submit grande y prominente */}
      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="w-full font-stencil bg-brand-red text-white py-4 rounded-xl text-base tracking-wide
                   hover:bg-brand-red-dark transition-all duration-300 disabled:opacity-60
                   shadow-lg shadow-brand-red/25 hover:shadow-xl hover:shadow-brand-red/30
                   hover:-translate-y-0.5 active:scale-[0.98] mt-2"
      >
        {form.formState.isSubmitting ? "CREANDO CUENTA..." : "CREAR CUENTA"}
      </button>

      <p className="text-xs text-gray-400 text-center font-medium">
        {getSupabaseBrowserEnv()
          ? "Puede que recibas un correo de confirmación."
          : "Modo demo — sin Supabase configurado."}
      </p>

      {/* Hick's Law: solo 2 opciones de navegación post-form */}
      <div className="flex items-center justify-between pt-1">
        <Link href={siteConfig.urls.login} className="text-sm font-semibold text-brand-red hover:text-brand-red-dark transition-colors">
          Ya tengo cuenta
        </Link>
        <Link href={siteConfig.urls.explorar} className="text-xs font-medium text-gray-400 hover:text-brand-red transition-colors">
          Explorar sin cuenta →
        </Link>
      </div>
      </form>
    </div>
  )
}

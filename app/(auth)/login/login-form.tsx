"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"
import { getMockSession, setMockSession } from "@/lib/auth/mock-session"
import { siteConfig } from "@/config/site"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { safeNextPath } from "@/lib/security/safe-redirect"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = safeNextPath(searchParams.get("next"))
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  useEffect(() => {
    const err = searchParams.get("error")
    if (err === "auth") {
      toast.error("No se pudo completar el inicio de sesion. Prueba de nuevo.")
    }
    if (err === "config") {
      toast.error("Supabase no esta configurado (revisa .env.local).")
    }
  }, [searchParams])

  const onSubmit = async (data: LoginInput) => {
    const email = data.email.trim().toLowerCase()
    const env = getSupabaseBrowserEnv()

    if (!env) {
      const existing = getMockSession()
      if (existing && existing.email === email) {
        router.push(nextPath)
        router.refresh()
        return
      }
      const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      setMockSession({
        id,
        email,
        displayName: email.split("@")[0] ?? "Usuario",
      })
      router.push(nextPath)
      router.refresh()
      return
    }

    try {
      const supabase = createBrowserSupabaseClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: data.password,
      })
      if (error) {
        const msg =
          error.message === "Invalid login credentials"
            ? "Correo o contrasena incorrectos."
            : error.message === "Email logins are disabled"
              ? "Inicio con correo desactivado en Supabase. En el dashboard: Authentication → Providers → Email → activar."
              : error.message
        toast.error(msg)
        return
      }
      toast.success("Sesion iniciada")
      router.push(nextPath)
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al iniciar sesion")
    }
  }

  return (
    <div className="space-y-5">
      <GoogleOAuthButton nextPath={nextPath} />
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
          <p className="text-red-600 text-xs mt-1 form-error-in">{form.formState.errors.email.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Contrasena
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p className="text-red-600 text-xs mt-1 form-error-in">{form.formState.errors.password.message}</p>
        )}
        {getSupabaseBrowserEnv() ? (
          <div className="text-right">
            <Link
              href={siteConfig.urls.recuperarContrasena}
              className="text-xs text-brand-red hover:underline"
            >
              Olvide mi contrasena
            </Link>
          </div>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="w-full font-stencil bg-brand-red text-white py-3 rounded-full hover:bg-brand-red-dark transition-colors disabled:opacity-60"
      >
        ENTRAR
      </button>
      <p className="text-xs text-gray-400 text-center">
        {getSupabaseBrowserEnv()
          ? "Puedes usar Google o correo y contrasena (validacion en Supabase)."
          : "Sin Supabase en .env.local: modo demo local (sin validar contrasena)."}
      </p>
      <div className="text-center space-y-2">
        <Link href={`${siteConfig.urls.registro}?next=${encodeURIComponent(nextPath)}`} className="text-sm text-brand-red hover:underline block">
          Crear cuenta
        </Link>
        <Link href={siteConfig.urls.explorar} className="text-xs text-gray-400 hover:text-brand-red block">
          Explorar chazas sin cuenta
        </Link>
      </div>
      </form>
    </div>
  )
}

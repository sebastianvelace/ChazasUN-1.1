"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updatePasswordSchema, type UpdatePasswordInput } from "@/lib/validations/auth"
import { siteConfig } from "@/config/site"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"

export function RestablecerContrasenaForm() {
  const router = useRouter()
  const form = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: "", confirm: "" },
  })

  const onSubmit = async (data: UpdatePasswordInput) => {
    const env = getSupabaseBrowserEnv()
    if (!env) {
      toast.error("Supabase no esta configurado.")
      return
    }

    try {
      const supabase = createBrowserSupabaseClient()
      const { error } = await supabase.auth.updateUser({ password: data.password })
      if (error) {
        toast.error(error.message)
        return
      }
      toast.success("Contrasena actualizada")
      router.push(siteConfig.urls.explorar)
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Nueva contrasena
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
      <div>
        <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
          Confirmar
        </label>
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
          {...form.register("confirm")}
        />
        {form.formState.errors.confirm && (
          <p className="text-red-600 text-xs mt-1">{form.formState.errors.confirm.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="w-full font-stencil bg-brand-red text-white py-3 rounded-full hover:bg-brand-red-dark transition-colors disabled:opacity-60"
      >
        GUARDAR CONTRASENA
      </button>
      <div className="text-center">
        <Link href={siteConfig.urls.login} className="text-sm text-brand-red hover:underline">
          Ir a entrar
        </Link>
      </div>
    </form>
  )
}

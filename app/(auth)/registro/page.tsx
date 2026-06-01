import { Suspense } from "react"
import Link from "next/link"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { RegistroForm } from "./registro-form"
import { siteConfig } from "@/config/site"

export const metadata = { title: "Crear cuenta | ChazasUN" }

export default function RegistroPage() {
  return (
    <AuthPageShell>
      <div className="mb-8">
        <h1 className="font-stencil text-5xl text-brand-red mb-2 tracking-wide">CREAR CUENTA</h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          Explorar no requiere cuenta.{" "}
          <span className="text-gray-600">Registrate para guardar favoritos o publicar tu chaza.</span>
        </p>
        <Link href={siteConfig.urls.explorar} className="inline-block text-xs text-brand-red hover:underline mt-2">
          Ir a explorar sin registrarme
        </Link>
      </div>
      <Suspense fallback={null}>
        <RegistroForm />
      </Suspense>
    </AuthPageShell>
  )
}

import { Suspense } from "react"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { LoginForm } from "./login-form"

export const metadata = { title: "Entrar" }

export default function LoginPage() {
  return (
    <AuthPageShell>
      <div className="mb-8">
        <h1 className="font-stencil text-5xl text-brand-red mb-2 tracking-wide">ENTRAR</h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          Explorar no requiere cuenta.{" "}
          <span className="text-gray-600">Entra para guardar likes y favoritos.</span>
        </p>
      </div>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthPageShell>
  )
}

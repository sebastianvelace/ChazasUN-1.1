import { Suspense } from "react"
import { LoginForm } from "./login-form"

export const metadata = { title: "Entrar | ChazasUN" }

export default function LoginPage() {
  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
      <h1 className="font-stencil text-3xl text-brand-red text-center mb-2">ENTRAR</h1>
      <p className="text-gray-500 text-sm text-center mb-8">
        Explorar el swiper no requiere cuenta. Entra para guardar likes y favoritos.
      </p>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  )
}

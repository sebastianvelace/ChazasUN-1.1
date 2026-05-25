import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { RegistroForm } from "./registro-form"

export const metadata = { title: "Crear cuenta | ChazasUN" }

export default function RegistroPage() {
  return (
    <AuthPageShell>
      <div className="mb-8">
        <h1 className="font-stencil text-5xl text-brand-red mb-2 tracking-wide">CREAR CUENTA</h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          Sin carnet ni datos sensibles.{" "}
          <span className="text-gray-600">Guarda likes, favoritos y publica tu chaza.</span>
        </p>
      </div>
      <RegistroForm />
    </AuthPageShell>
  )
}

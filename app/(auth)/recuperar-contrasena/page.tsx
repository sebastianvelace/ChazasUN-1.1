import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { RecuperarContrasenaForm } from "./recuperar-form"

export const metadata = { title: "Recuperar contraseña" }

export default function RecuperarContrasenaPage() {
  return (
    <AuthPageShell>
      <div className="mb-8">
        <h1 className="font-stencil text-5xl text-brand-red mb-2 tracking-wide">RECUPERAR ACCESO</h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          Te enviamos un enlace al correo.{" "}
          <span className="text-gray-600">Las contraseñas no se pueden ver, solo restablecer.</span>
        </p>
      </div>
      <RecuperarContrasenaForm />
    </AuthPageShell>
  )
}

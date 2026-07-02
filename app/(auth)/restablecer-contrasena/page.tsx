import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { RestablecerContrasenaForm } from "./restablecer-form"

export const metadata = { title: "Nueva contraseña" }

export default function RestablecerContrasenaPage() {
  return (
    <AuthPageShell>
      <div className="mb-8">
        <h1 className="font-stencil text-5xl text-brand-red mb-2 tracking-wide">NUEVA CONTRASENA</h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          Entraste desde el enlace del correo.{" "}
          <span className="text-gray-600">Elige tu nueva contraseña aquí.</span>
        </p>
      </div>
      <RestablecerContrasenaForm />
    </AuthPageShell>
  )
}

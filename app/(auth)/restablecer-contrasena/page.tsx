import { RestablecerContrasenaForm } from "./restablecer-form"

export const metadata = { title: "Nueva contraseña | ChazasUN" }

export default function RestablecerContrasenaPage() {
  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
      <h1 className="font-stencil text-3xl text-brand-red text-center mb-2">NUEVA CONTRASENA</h1>
      <p className="text-gray-500 text-sm text-center mb-8">
        Entra desde el enlace del correo. Luego elige tu nueva contrasena aqui.
      </p>
      <RestablecerContrasenaForm />
    </div>
  )
}

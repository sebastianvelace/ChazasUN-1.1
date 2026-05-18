import { RecuperarContrasenaForm } from "./recuperar-form"

export const metadata = { title: "Recuperar contraseña | ChazasUN" }

export default function RecuperarContrasenaPage() {
  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
      <h1 className="font-stencil text-3xl text-brand-red text-center mb-2">RECUPERAR ACCESO</h1>
      <p className="text-gray-500 text-sm text-center mb-8">
        Te enviamos un enlace por correo. Las contrasenas no se pueden ver: solo restablecer con ese enlace.
      </p>
      <RecuperarContrasenaForm />
    </div>
  )
}

import Link from "next/link"
import { siteConfig } from "@/config/site"
import { RegistroForm } from "./registro-form"

export const metadata = { title: "Crear cuenta | ChazasUN" }

export default function RegistroPage() {
  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
      <h1 className="font-stencil text-3xl text-brand-red text-center mb-2">CREAR CUENTA</h1>
      <p className="text-gray-500 text-sm text-center mb-8">
        Guarda likes, chazas favoritas y publica tu puesto. Sin carnet ni datos sensibles.
      </p>
      <RegistroForm />
      <div className="text-center mt-6">
        <Link href={siteConfig.urls.login} className="text-sm text-brand-red hover:underline">
          Ya tengo cuenta
        </Link>
      </div>
    </div>
  )
}

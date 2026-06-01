import Link from "next/link"
import { PageContainer, PageHeader } from "@/components/layout"
import { PublishChazaWizard } from "@/components/forms/publish-chaza-wizard"

export const metadata = {
  title: "Publicar mi chaza | ChazasUN",
}

export default function PublicarChazaPage() {
  return (
    <PageContainer size="md">
      <PageHeader
        eyebrow="Chazeros"
        title="PUBLICA TU CHAZA"
        description="Completa el asistente para registrar tu puesto en ChazasUN."
      />
      <p className="text-sm text-gray-500 mb-8">
        ¿Primera vez?{" "}
        <Link href={`/registro?next=${encodeURIComponent("/publicar-chaza")}`} className="text-brand-red font-medium hover:underline">
          Crea una cuenta
        </Link>
        {" "}·{" "}
        <Link href="/explorar" className="text-gray-500 hover:text-brand-red hover:underline">
          Explorar sin cuenta
        </Link>
      </p>
      <PublishChazaWizard
        menuVisionEnabled={
          process.env.ENABLE_MENU_VISION === "true" && Boolean(process.env.GROQ_API_KEY)
        }
      />
    </PageContainer>
  )
}

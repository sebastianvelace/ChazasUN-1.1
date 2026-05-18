import { PageContainer, PageHeader } from "@/components/layout"

export const metadata = {
  title: "Terminos de uso | ChazasUN",
}

export default function TerminosPage() {
  return (
    <PageContainer size="md">
      <PageHeader
        eyebrow="Legal"
        title="TERMINOS DE USO"
        description="Prototipo estudiantil. Estos terminos son orientativos hasta revision juridica formal."
      />
      <div className="prose prose-gray max-w-none text-gray-600 text-sm space-y-4">
        <p>
          ChazasUN es un proyecto independiente elaborado por estudiantes y no representa a la Universidad Nacional
          de Colombia ni a sus autoridades.
        </p>
        <p>
          El contenido publicado por usuarios en esta demo (informacion de chazas, reseñas, imagenes enlazadas) es
          responsabilidad de quien lo publica. El equipo del proyecto puede retirar contenido que incumpla normas de
          convivencia o la ley aplicable cuando exista backend y moderacion.
        </p>
        <p>
          El sello <strong>Verificada</strong> en una ficha indica que el equipo de ChazasUN reviso datos basicos del
          puesto; <strong>no</strong> constituye aval oficial de la Universidad Nacional de Colombia ni certifica
          calidad sanitaria ni legal del negocio.
        </p>
        <p>
          Los datos de cuenta y favoritos en esta fase son locales al navegador (sin garantia de persistencia ni
          seguridad de nivel produccion). Al migrar a Supabase se aplicaran politicas de privacidad y tratamiento de
          datos actualizadas.
        </p>
      </div>
    </PageContainer>
  )
}

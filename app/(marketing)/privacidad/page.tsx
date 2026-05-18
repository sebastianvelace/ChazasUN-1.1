import { PageContainer, PageHeader } from "@/components/layout"

export const metadata = {
  title: "Privacidad | ChazasUN",
}

export default function PrivacidadPage() {
  return (
    <PageContainer size="md">
      <PageHeader
        eyebrow="Legal"
        title="PRIVACIDAD"
        description="Resumen de como tratamos datos en ChazasUN."
      />
      <div className="prose prose-gray max-w-none text-gray-600 text-sm space-y-4">
        <p>
          Con <strong>Supabase</strong> (Auth y Postgres) tu cuenta, perfil, chazas publicadas, favoritos y
          reseñas se almacenan en el proyecto que configure el equipo. Las politicas de seguridad (RLS) limitan
          quien puede leer o escribir cada fila segun el diseno del producto.
        </p>
        <p>
          Si abres la app <strong>sin</strong> variables de Supabase en el entorno, algunas funciones siguen un
          modo demo: sesion simulada, likes/guardados o reseñas pueden guardarse solo en el{" "}
          <strong>localStorage</strong> de tu navegador. Ese modo no envia esos datos a un backend de ChazasUN.
        </p>
        <p>
          Las metricas anonimas de producto (por ejemplo tiempo en tarjeta del swiper) pueden enviarse como
          eventos a la base cuando Supabase esta activo, y en demo local pueden quedar en{" "}
          <strong>sessionStorage</strong>.
        </p>
        <p>
          Puedes borrar cookies, almacenamiento del sitio o tu cuenta segun las opciones del navegador y del
          proveedor. Para una politica detallada y bases legales (LOPD/ GDPR) conviene publicar una version
          revisada cuando el servicio sea publico.
        </p>
      </div>
    </PageContainer>
  )
}

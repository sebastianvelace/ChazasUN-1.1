/** Configuración global del sitio (marca, metas, campus). */

export const siteConfig = {
  name: "ChazasUN",
  tagline: "El marketplace de los estudiantes de la Universidad Nacional",
  description:
    "Descubre chazas en el campus de Bogotá: comida, servicios, libros y más. Conecta con emprendedores sin salir de la U.",
  campus: {
    id: "bogota",
    name: "Sede Bogotá",
    slug: "bogota",
  },
  urls: {
    explorar: "/explorar",
    recomendados: "/recomendados",
    guardadas: "/guardadas",
    mapa: "/mapa",
    publicarChaza: "/publicar-chaza",
    login: "/login",
    registro: "/registro",
    recuperarContrasena: "/recuperar-contrasena",
    restablecerContrasena: "/restablecer-contrasena",
    blog: "/blog",
    misChazas: "/mis-chazas",
    adminMetricas: "/admin/metricas",
  },
  goals: {
    chazasMonth1: 30,
    chazasMonth2: 50,
  },
  /** Igual visibilidad en exploración; reseñas no reordenan el feed principal. */
  product: {
    equalVisibility: true,
    passRotatesToEnd: true,
    recommendationsIncludeMapProximity: true,
    recommendationsIncludePopular: false,
  },
} as const

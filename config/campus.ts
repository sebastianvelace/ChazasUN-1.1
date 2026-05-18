/** Campus UN Bogota — mapa e integracion con Google Maps. */

export const campusConfig = {
  id: "bogota",
  name: "Universidad Nacional de Colombia — Sede Bogotá",
  /** Plano esquematico (numeracion de edificios, porterias). */
  mapImageUrl: "/maps/campus-bogota.png",
  /** Centro aproximado del campus para Google Maps. */
  center: {
    lat: 4.638,
    lng: -74.0836,
  },
  /** Busqueda por nombre si no hay coordenadas de chaza. */
  googleMapsQuery: "Universidad Nacional de Colombia, Bogotá",
} as const

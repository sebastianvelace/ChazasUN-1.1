# Mapa e integracion con Google Maps

## Plano del campus

Usamos el **mapa esquematico a color** (numeracion de edificios, porterias, vias peatonales) en:

`public/maps/campus-bogota.png`

Es mas util para estudiantes que el render 3D en escala de grises.

## Dos capas (sin conflicto)

| Capa | Para que sirve | Requiere API key |
|------|----------------|------------------|
| **Plano interactivo** (`CampusMap`) | Pins % sobre imagen; igual visibilidad; chazero mueve pin (fase 2) | No |
| **Google Maps** (enlaces externos) | Direcciones reales, caminar desde el celular | No |
| **Google Maps embebido** (opcional) | Mapa satelite + overlay del campus | Si (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`) |

## Sin base de datos

Los pins vienen de `lib/constants/mock-chazas.ts` con:

- `mapPosition: { x, y }` — porcentaje sobre la imagen
- `geo: { lat, lng }` — para URLs de Google Maps

Al conectar Supabase, mismos campos en tabla `chazas`.

## URLs de Google Maps (ya implementadas)

- Campus: `googleMapsCampusUrl()`
- Chaza: `googleMapsPlaceUrl(lat, lng, nombre)`

Abren la app o web de Google Maps del usuario.

## API key (opcional, fase posterior)

1. [Google Cloud Console](https://console.cloud.google.com/) → Maps JavaScript API
2. Restringir key por dominio (Vercel)
3. Agregar a `.env.local`:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_key
```

Con key se puede embeber mapa con `GroundOverlay` del plano PNG sobre coordenadas del campus.

## Calibracion de pins

Los porcentajes `mapPosition` son aproximados. Cuando tengas ubicaciones reales de chazas, ajusta en mock o en panel del chazero.

Edificio **310** (zona Carrera 30) esta referenciado en mock para Libreria El Saber como ejemplo.

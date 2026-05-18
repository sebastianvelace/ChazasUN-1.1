# Arquitectura del repositorio

## Principios

- **App Router** con route groups por responsabilidad.
- **Colocation**: componentes de dominio en `components/chazas`, `components/map`, etc.
- **Tipos compartidos** en `types/`, configuracion en `config/`.
- **Sin logica de negocio en UI**: hooks + `lib/actions` (server) + Supabase.
- **Analytics sin PII**: sesion anonima en `sessionStorage`, eventos en `lib/analytics`.

## Arbol de carpetas

```
app/
  (marketing)/          # Landing publica — /
  (platform)/           # App: explorar, mapa, chazas, publicar
  (auth)/               # login, registro
  layout.tsx
  globals.css

components/
  landing/              # Secciones marketing (solo home)
  chazas/               # Swiper, cards, detalle
  layout/               # Headers, page shells
  shared/               # Coming soon, utilidades UI
  analytics/            # Provider de page views
  ui/                   # shadcn

config/                 # site.ts, categories.ts
types/                  # Dominio TypeScript
lib/
  analytics/            # trackEvent, session anonima
  constants/            # mocks temporales
  security/             # profanity filter
  validations/          # schemas Zod
  supabase/             # clientes SSR + admin (seed) + cliente publico anon (build SSG)
  actions/              # Server Actions (chazas, publish, favorites, reviews, reports, stats, analytics export CSV, chaza-products, menu-vision, admin-chaza-verify, admin-chaza-featured…)
  ai/                   # Config cliente vision (Groq) solo servidor
  utils/                # csv, parse-carta-bulk, etc.
hooks/
supabase/migrations/
public/maps/            # Plano campus
docs/
```

## Rutas

| Ruta | Grupo | Estado |
|------|-------|--------|
| `/` | marketing | Landing |
| `/explorar` | platform | Swiper + DB/mock |
| `/recomendados` | platform | Recomendados (likes + geo) |
| `/guardadas` | platform | Favoritos save |
| `/mapa` | platform | Mapa campus + pins |
| `/publicar-chaza` | platform | Wizard → Server Action |
| `/mis-chazas` | platform | Lista del dueno; enlaces a editar |
| `/mis-chazas/[slug]/editar` | platform | Edicion chaza + PinPicker |
| `/chazas/[slug]` | platform | Detalle + resenas + reportes (Supabase) |
| `/blog` | platform | Listado estatico (`lib/constants/blog-posts.ts`) |
| `/blog/[slug]` | platform | Detalle de articulo estatico + `generateStaticParams` |
| `/admin/metricas` | platform | Metricas DB + pestaña Reportes (admin) |
| `/login`, `/registro` | auth | Supabase + mock fallback; Google OAuth + email |
| `/recuperar-contrasena`, `/restablecer-contrasena` | auth | Flujo recuperacion de contrasena |
| `/terminos`, `/privacidad` | marketing | Legales |

## Flujo de datos (fase Supabase)

```
Client (RSC / hooks)
  → Server Actions / Route Handlers (Zod)
    → Supabase (RLS)
      → PostgreSQL
```

## Visibilidad de chazas

- Feed del swiper: orden tipo **flashcards** (pass → al final del mazo).
- **No** hay ranking por populares en MVP.
- Resenas/estrellas: informacion en detalle, no afectan orden del explorador.
- Recomendados: likes del usuario + proximidad en mapa (fase 2).

# Plan de construccion — ChazasUN

## Metas de negocio

- **Mes 1:** 30 chazas registradas
- **Mes 2:** 50 chazas acumuladas
- QR en puestos fisicos + incentivos para chazeros (definir con equipo de campo)

## Fase 0 — Estructura y frontend (completada)

- [x] Arquitectura de carpetas y rutas
- [x] Tipos, config, mocks centralizados
- [x] Swiper flashcards (pass no oculta para siempre)
- [x] Analytics anonimo (eventos en sessionStorage)
- [x] Navbar/hero enlazados a rutas reales
- [x] Filtro profanidad (base)
- [x] Plano campus en `public/maps/campus-bogota.png` + componente `CampusMap`
- [x] Enlaces Google Maps sin API key
- [x] Auth prompt en like/guardar (sin cuenta para swipe)
- [x] Paginas legales (terminos, privacidad)

## Prototipo localStorage → Supabase (Fase 1)

- Con env Supabase activo, los origenes locales quedan como **fallback** si falta sesion o en desarrollo sin proyecto.

| Clave / origen local | Uso actual | Tabla / columna futura (referencia) |
|----------------------|------------|-------------------------------------|
| `chazasun_mock_session` | Sesion demo `{ id, email, displayName }` | `auth.users` + `profiles` |
| `chazasun_liked_ids` | IDs de chazas con like | `favorites` o `swipe_events` (`like`) |
| `chazasun_saved_ids` | IDs guardados | `favorites` (tipo save) |
| `chazasun_published_chazas` | Array `ChazaCard` publicadas | `chazas` + `chaza_categories` + productos |
| `chazasun_reviews` | Reseñas `{ chazaId, rating, body, ... }` | `reviews` |
| `chazasun_events_buffer` (sessionStorage) | Metricas demo | `analytics_events` |
| `chazasun_admin_metrics_unlock` | Flag demo panel | N/A (solo demo) |

Los campos de `ChazaCard` (`slug`, `mapPosition`, `geo`, `categorySlugs`, etc.) deben alinearse con el esquema SQL de Fase 1; el wizard ya valida con `publishChazaSchema` como espejo de futuras Server Actions.

## Checklist prueba manual (Fase 1 datos)

1. `pnpm dev` (puerto **3001**).
2. Una vez: `pnpm db:seed` con migracion SQL aplicada y `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`.
3. Registro/login → `/explorar` lista chazas desde DB → like y guardar persisten tras recargar.
4. Publicar chaza desde wizard → aparece en explorar y detalle.
5. Resena en detalle → visible tras recargar; una reseña por usuario y chaza.
6. En Supabase: tablas `chazas`, `favorites`, `reviews`, `profiles` con filas esperadas.

## Fase 1 — Supabase core (2–3 semanas)

1. [x] Proyecto Supabase + `.env.local` (guia: `docs/SUPABASE_SETUP.md`)
2. [x] Aplicar migracion SQL inicial en `supabase/migrations/` (tablas + RLS + seed categorias)
3. [x] RLS policies (incluidas en migracion)
4. [x] Auth email/password
5. [x] CRUD publicar chaza (Server Action + wizard; slug unico con reintento ante colision)
6. [x] Swiper y detalle desde DB cuando hay env (`useChazaCatalog`, detalle por slug en catalogo)
7. [x] Persistir likes/guardados (`favorites` + `useFavorites`)
8. [x] Reseñas en DB + filtro profanidad en servidor
9. [x] Storage para imagenes de portada (`chaza-covers` + upload en wizard)
10. [x] Panel admin sobre datos reales (`/admin/metricas` + `is_admin` / `ADMIN_USER_IDS`)

## Fase 2 — Produccion, medios y descubrimiento (cerrada en codigo local)

Plan detallado: [`docs/FASE_2_PLAN.md`](FASE_2_PLAN.md).

Hecho en codigo:

1. [x] Storage portadas + `uploadChazaCoverAction` en wizard
2. [x] Metadata/slugs dinamicos en detalle chaza
3. [x] Mapa: filtro categoria URL, empty likes, pins desde DB
4. [x] Analytics persistidos en `analytics_events`
5. [x] Panel admin lee agregados Supabase

Pendiente cuando quieras URL publica (no bloquea Fase 3 en local): ver checklist Vercel en [`docs/SUPABASE_SETUP.md`](SUPABASE_SETUP.md).

## Fase 3 — Comunidad, chazero y moderacion (hecha en codigo)

Plan detallado: [`docs/FASE_3_PLAN.md`](FASE_3_PLAN.md).

1. [x] Tabla `content_reports` + acciones servidor + UI reportar en detalle (Supabase)
2. [x] Panel admin: cola de reportes + descartar / ocultar reseña / suspender chaza
3. [x] `/mis-chazas` + editar datos, pin y estado (publicada / pausa / borrador)
4. [x] Hero con stats desde DB; privacidad y copy alineados a Supabase; busqueda en explorar; seed de reseñas opcional

Checklist manual: al final de `docs/FASE_3_PLAN.md`. Migracion reportes: aplicada en Supabase.

## Fase 4 — Contenido, export metricas e IA opcional (cerrada en codigo)

Plan detallado: [`docs/FASE_4_PLAN.md`](FASE_4_PLAN.md).

Orden sugerido:

1. [x] Export CSV de `analytics_events` en panel admin (entregas academicas)
2. [x] CRUD productos en `/mis-chazas` + carta visible en detalle
3. [x] (Opcional) Vision IA: foto de carta → productos sugeridos en wizard/editar (Groq + `menu_vision_usage`)
4. [x] Blog: detalle por slug (estatico); enlaces desde `/blog`, landing y `/blog/[slug]`
5. [ ] (Manual) Vercel + smoke produccion cuando quieras URL publica

## Fase 5 — Campo y crecimiento (siguiente)

Plan detallado: [`docs/FASE_5_PLAN.md`](FASE_5_PLAN.md) (kit QR, badge verificada, destacados fuera del swiper, deploy y ops).

1. [x] 5.1 Compartir enlace / QR a `/chazas/[slug]` (`ChazaShareButton` en detalle y `/mis-chazas`)
2. [x] 5.2 `verified_at` + admin + badge en UI
3. [x] 5.3 Destacados en franja horizontal en `/explorar` (sin reordenar el mazo)
4. [ ] 5.4 Deploy Vercel + smoke; metas de campo 30/50 chazas

## Incentivos chazeros (operaciones — no codigo aun)

- Badge “Chaza verificada en ChazasUN” para QR
- Destacado temporal al registrar (sin romper igualdad de visibilidad en swiper)
- Kit QR imprimible

## Metricas para entregas academicas/presentaciones

Desde `getAnalyticsBuffer()` o tabla `analytics_events`:

- Sesiones unicas / dia
- Tiempo medio por tarjeta (`swiper_card_time`)
- Likes vs pass ratio
- Paginas mas visitadas
- Chazas publicadas (conteo DB)

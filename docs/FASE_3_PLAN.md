# Fase 3 — Comunidad, chazero y moderacion

Referencia rapida de lo implementado en codigo. Migraciones en `supabase/migrations/`.

## 3.1 Reportes y moderacion

| Pieza | Ubicacion |
|-------|-----------|
| SQL `content_reports` + RLS + politicas admin sobre `chazas`/`reviews` | `20260221120000_reports_moderation.sql` |
| Validacion | `lib/validations/report.ts` |
| Actions | `lib/actions/reports.ts` (`createReportAction`, `listPendingReportsAction`, `resolveReportAction`) |
| UI usuario | `components/chazas/chaza-detail-client.tsx` (reportar chaza y reseñas con UUID de DB) |
| UI admin | Pestaña **Reportes** en `app/(platform)/admin/metricas/admin-metricas-client.tsx` |

Acciones de resolucion: descartar, ocultar reseña (`reviews.status = hidden`), suspender chaza (`chazas.status = suspended`).

## 3.2 Dashboard chazero

| Pieza | Ubicacion |
|-------|-----------|
| Actions | `lib/actions/my-chazas.ts` |
| Validacion edicion | `updateChazaSchema` en `lib/validations/chaza.ts` |
| Lista | `app/(platform)/mis-chazas/page.tsx` |
| Editar | `app/(platform)/mis-chazas/[slug]/editar/page.tsx` + `components/chazas/edit-chaza-form.tsx` |
| Header | `components/layout/platform-header.tsx` enlace **Mis chazas** (sesion iniciada) |

## 3.3 Pulido producto (local)

- Hero con conteos reales: `lib/actions/stats.ts` + `getPublicStatsAction` consumido en `app/(marketing)/page.tsx`.
- Privacidad: `app/(marketing)/privacidad/page.tsx` (Supabase + fallback local).
- Copy guardados / wizard segun env Supabase: `guardadas-client`, `publish-chaza-wizard`.
- Busqueda por nombre en `/explorar`: `ChazaSwiper` prop `showNameSearch`.
- Seed opcional de reseñas: `scripts/seed-demo-chazas.ts` (una reseña por chaza nueva, usuario demo).

## Checklist manual Fase 3

1. Aplicar migracion de reportes en Supabase si aun no esta.
2. `pnpm dev` — login como chazero → publicar → `/mis-chazas` → editar pin y pausar.
3. Segunda cuenta → reportar reseña con UUID → admin ve cola y resuelve.
4. `/admin/metricas` — pestañas Metricas / Reportes; agregados DB siguen visibles.
5. Landing: hero muestra conteos tras seed.
6. `/explorar`: buscar por nombre.

## Fuera de Fase 3

Chat in-app, pagos, ranking por populares en swiper.

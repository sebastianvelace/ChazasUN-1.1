# Calendario del proyecto — 8 semanas (sin IA en desarrollo)

Planificación **hipotética** de ChazasUN si el producto se construyera **desde cero en ocho semanas**, con **desarrollo manual** (sin asistentes de código, sin generación automática de UI/SQL ni copilotos). Las semanas **7 y 8** se dedican a **marketing y publicidad**; el software debe estar **desplegado y estable** al terminar la semana 6.

**Equipo de referencia:** 1 persona de desarrollo (tiempo completo o ~30–40 h/semana) + 5 personas de operaciones/campo/marketing (participación parcial desde la semana 1, intensiva en semanas 7–8).

**Metas de negocio al cierre:** URL pública en Vercel, piloto en campus UN Bogotá, hoja de seguimiento de chazas activa y **objetivo operativo** de acercarse a **30 chazas registradas** en el primer mes post-lanzamiento (según [`BUILD_PLAN.md`](BUILD_PLAN.md)).

---

## Vista rápida

| Semana | Enfoque principal | Entregable clave |
|--------|-------------------|-----------------|
| **1** | Producto + frontend base | Prototipo navegable (mocks), swiper, legales |
| **2** | Backend Supabase + auth | Base de datos, registro/login, primeras chazas en DB |
| **3** | Publicar y explorar reales | Wizard, detalle, likes/guardados, imágenes |
| **4** | Mapa, reseñas y métricas | Mapa campus, comentarios, panel admin básico |
| **5** | Comunidad y moderación | Reportes, `/mis-chazas`, edición del chazero |
| **6** | Contenido, campo y deploy | Carta/productos, QR, verificada, Vercel en producción |
| **7** | Marketing — preparación y lanzamiento | Redes, materiales, primeros aliados, soft launch |
| **8** | Marketing — campaña y crecimiento | Campo intensivo, QR en puestos, meta 30 chazas |

---

## Semana 1 — Descubrimiento, diseño y frontend (Fase 0)

**Desarrollo (~35–40 h)**

- Definir alcance MVP: swiper, mapa, publicar chaza, sin chat ni pagos (alineado al README del producto).
- Wireframes en Figma o papel: landing, `/explorar`, detalle, wizard de publicación, mapa.
- Repositorio Next.js (App Router), Tailwind, estructura de carpetas y rutas vacías.
- Landing, navbar, páginas legales borrador (`/terminos`, `/privacidad`).
- **Swiper tipo flashcards:** like, pass (va al final del mazo), guardar con prompt de login.
- Datos mock centralizados; plano del campus en `public/maps/` y componente mapa estático.
- Filtro básico de palabras ofensivas en cliente (lista inicial).
- Analytics anónimo en `sessionStorage` (eventos de swiper y páginas).

**Equipo no técnico (4–6 h total)**

- Lista de zonas del campus (plazoletas, edificios) para el mapa.
- Guion de 30 segundos: “qué es ChazasUN”.
- Inventario preliminar: 15–20 chazas conocidas para contactar después.

**Criterio de cierre:** `pnpm dev` muestra flujo explorar → detalle mock sin backend.

---

## Semana 2 — Supabase, esquema y autenticación (Fase 1, parte 1)

**Desarrollo (~35–40 h)**

- Proyecto Supabase, variables `.env.local`, documentación interna de setup.
- Migración inicial: `profiles`, `categories`, `chazas`, productos, favoritos, `swipe_events`, RLS.
- Auth email/contraseña; callback y sesión en middleware o layout protegido.
- Seed de categorías (`pnpm db:seed` con service role solo en local).
- Conectar `/explorar` y detalle a lectura desde DB (sustituir mocks progresivamente).
- Políticas RLS: público lee chazas publicadas; dueño edita la suya.

**Equipo no técnico**

- Revisar copy de términos y privacidad (lenguaje claro, sin aval UN).
- Google Form de feedback para chazeros (borrador).

**Criterio de cierre:** registro, login y al menos una chaza de prueba persistida en Supabase.

---

## Semana 3 — Publicar chaza, favoritos y medios (Fase 1, parte 2)

**Desarrollo (~35–40 h)**

- Wizard `/publicar-chaza` con validación Zod + Server Actions.
- Slug único con reintento ante colisión; estados borrador / publicada / pausa.
- Storage bucket `chaza-covers`; subida de portada en el wizard.
- Persistir likes y guardados en `favorites` (o modelo acordado).
- Páginas `/guardadas` y `/recomendados` (versión simple: likes + cercanía básica).
- Pruebas manuales según checklist de [`BUILD_PLAN.md`](BUILD_PLAN.md) § Fase 1.

**Equipo no técnico**

- Probar el wizard con 2–3 chazas reales (con ayuda del dev); anotar fricciones.
- Fotos y precios de ejemplo para pruebas de contenido.

**Criterio de cierre:** una chaza publicada por un usuario distinto al admin aparece en explorar tras recargar.

---

## Semana 4 — Mapa, reseñas y analytics (Fase 2)

**Desarrollo (~35–40 h)**

- Mapa interactivo: pins desde DB, filtro por categoría en URL.
- Reseñas en DB: una por usuario y chaza; filtro de profanidad en servidor.
- Tabla `analytics_events` + envío desde cliente; panel `/admin/metricas` (solo admin).
- Metadata dinámica en `/chazas/[slug]`; hero con estadísticas desde DB.
- Búsqueda simple en explorar (opcional pero útil para demo).

**Equipo no técnico**

- Validar ubicaciones de pins en mapa (¿coinciden con la realidad del campus?).
- Primera versión de hoja Notion/Excel: chaza | contacto | estado | fecha.

**Criterio de cierre:** reseña visible tras recarga; admin ve conteos básicos en panel.

---

## Semana 5 — Moderación y panel del chazero (Fase 3)

**Desarrollo (~35–40 h)**

- Tabla `content_reports`; botón reportar en detalle de chaza/reseña.
- Cola en admin: descartar, ocultar reseña, suspender chaza.
- `/mis-chazas`: listado del dueño; editar datos, pin en mapa, pausar/publicar.
- Ajustes de copy en privacidad (qué se guarda en Supabase).
- Regresión manual completa del flujo crítico.

**Equipo no técnico**

- Definir criterios internos de “chaza verificada” (presencia en campus, datos coherentes).
- Ensayo del guion de campo con 2 chazeros amigos.

**Criterio de cierre:** reporte llega a admin; chazero edita su ficha sin tocar código.

---

## Semana 6 — Carta, herramientas de campo y producción (Fases 4 y 5)

**Desarrollo (~40–45 h)** — semana más densa; sin IA, la carta y el deploy consumen tiempo real.

- CRUD de productos en `/mis-chazas` y carta visible en detalle.
- Blog estático: `lib/constants/blog-posts.ts`, rutas `/blog` y `/blog/[slug]` (2–3 artículos iniciales escritos a mano).
- Export CSV de `analytics_events` en admin (entregas académicas).
- *(Opcional si hay tiempo)* visión de carta con Groq — muchos equipos lo **posponen** sin IA y cargan productos a mano.
- **Fase 5 en código:** `ChazaShareButton`, QR descargable, `verified_at`, destacados fuera del swiper.
- **Deploy:** Vercel + migraciones en Supabase producción + Site URL y redirects + smoke Auth ([`VERCEL_DEPLOY.md`](VERCEL_DEPLOY.md)).
- Configurar `NEXT_PUBLIC_SITE_URL` para enlaces y QR correctos.

**Equipo no técnico**

- Redactar 1 entrada de blog (“Cómo encontrar chazas en el campus”).
- Diseño en Canva: poster A4 con QR a la URL de producción.
- Lista priorizada de 30 puestos a visitar (semana 8).

**Criterio de cierre:** URL `https://*.vercel.app` funcional; QR de una chaza piloto abre la ficha en móvil con datos reales.

---

## Semana 7 — Marketing: preparación y lanzamiento

**Desarrollo (~8–12 h)** — solo mantenimiento, bugs de piloto y ajustes de copy.

- Corregir incidencias del smoke en producción.
- Pequeñas mejoras SEO (títulos, descripciones en landing y detalle).
- Apoyar al equipo con capturas y enlaces cortos.

**Marketing y publicidad (~25–35 h equipo; 1–2 personas liderando)**

| Actividad | Detalle |
|-----------|---------|
| **Identidad en redes** | Crear/perfilizar Instagram (y opcional TikTok): bio, link en bio a ChazasUN, highlights “Qué es”, “Cómo usar”. |
| **Calendario de contenido** | 5–7 piezas programadas: reel del swiper, carrusel “chaza de la semana”, story con mapa. |
| **Lanzamiento suave** | Publicar en grupos de WhatsApp/Facebook de facultades (sin spam; pedir permiso a admins). |
| **Alianzas tempranas** | 3–5 chazas “embajadoras” con foto profesional y permiso para etiquetarlas. |
| **Material impreso** | Imprimir 20–30 posters con QR; versión mini QR para mostrador. |
| **Prensa estudiantil** | Contactar emisora/comunicaciones de facultad o periódico universitario (nota corta + enlace). |
| **Email / DM frío** | Mensaje tipo para chazeros: beneficio (visibilidad gratis), CTA a `/publicar-chaza`. |

**Operaciones**

- Reunión de 30 min: metas semana 8, roles en mapa del campus (quién cubre qué zona).
- Activar formulario de feedback y canal único (ej. WhatsApp Business o grupo interno).

**Criterio de cierre:** al menos **10 chazas publicadas** en producción y **500+ impresiones** combinadas en redes (métrica orientativa).

---

## Semana 8 — Marketing: campaña en campus y crecimiento

**Desarrollo (~4–8 h)**

- Monitoreo de errores en Vercel; moderación admin si hay reportes.
- Verificar chazas destacadas o verificadas acordadas con operaciones.

**Marketing y publicidad (~30–40 h equipo; salida a campo diaria)**

| Actividad | Detalle |
|-----------|---------|
| **Blitz de campo** | 2 personas recorren zonas alta afluencia (Ciencias, Humanas, plazoletas); guion + tablet con la web. |
| **QR en puesto** | Cada chaza registrada recibe QR impreso y sticker; foto para redes (“Ya estamos en ChazasUN”). |
| **Incentivo chazero** | Badge “verificada” tras visita del equipo; destacado temporal en franja de explorar (acordado con admin). |
| **Contenido UGC** | Repost de historias de chazeros; concurso ligero (“muéstranos tu plato favorito” + mención). |
| **Micro-influencers** | 2–3 estudiantes con audiencia campus (500–2k seguidores): story patrocinada simbólica o trueque. |
| **Remarketing orgánico** | Segunda ronda de mensajes a chazas que dijeron “luego”; seguimiento en hoja de operaciones. |
| **Métricas de cierre** | Export CSV admin + conteo DB de chazas publicadas; informe de 1 página para stakeholders. |

**Meta operativa al domingo de semana 8**

- **25–30 chazas** con ficha completa (nombre, al menos un producto o precio, ubicación).
- **15+ chazas** con QR físico en el puesto.
- **3+ piezas** de contenido con engagement visible (comentarios, compartidos, no solo likes).

**Criterio de cierre:** informe semanal con número de chazas, capturas de redes y top 3 aprendizajes para el mes 2 (meta **50 chazas** acumuladas).

---

## Trabajo en paralelo (todo el proyecto)

| Rol | Semanas 1–6 | Semanas 7–8 |
|-----|-------------|---------------|
| **Desarrollo** | Construcción y deploy | Soporte y bugs |
| **Líder de campo (×2)** | Lista de contactos, pruebas de wizard | Recorrido campus, registro asistido |
| **Marketing (×1–2)** | Identidad visual, borradores de posts | Publicación diaria, alianzas, reels |
| **Operaciones** | Hoja de seguimiento | Métricas, feedback, priorización |
| **Coordinación** | Reunión semanal 30 min | Daily corto en semana 8 |

---

## Riesgos si no se usa IA (realistas)

| Riesgo | Mitigación en el calendario |
|--------|------------------------------|
| Semana 6 sobrecargada | Posponer visión Groq; blog con 2 posts cortos; destacados mínimos |
| Retraso en Supabase/RLS | Semana 2 no avanza a wizard hasta policies probadas |
| Pocas chazas en semana 8 | Empezar registro asistido en semana 5–6, no solo en marketing |
| QR con URL incorrecta | Deploy obligatorio fin de semana 6, no inicio de semana 8 |

---

## Relación con el código actual

Este calendario describe **cómo hubiéramos planificado el trabajo** en ocho semanas tradicionales. El repositorio hoy ya incluye las entregas de las **Fases 0–5.3** (ver [`BUILD_PLAN.md`](BUILD_PLAN.md)). Lo que suele quedar alineado con **semana 6** del plan es **5.4 deploy y smoke**; las **semanas 7–8** siguen siendo válidas como guía operativa aunque el código esté adelantado.

---

## Documentos relacionados

- [`README.md`](../README.md) — visión de producto y equipo  
- [`BUILD_PLAN.md`](BUILD_PLAN.md) — fases técnicas detalladas  
- [`FASE_5_PLAN.md`](FASE_5_PLAN.md) — QR, verificada, destacados, deploy  
- [`VERCEL_DEPLOY.md`](VERCEL_DEPLOY.md) — puesta en producción  

---

*Última actualización: mayo 2026 — planificación académica / operativa, no compromiso de fechas reales.*

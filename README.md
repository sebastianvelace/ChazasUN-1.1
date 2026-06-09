# ChazasUN

Marketplace universitario para conectar personas con **chazas** (puestos de venta en el campus de la Universidad Nacional de Colombia, sede Bogotá).

> Proyecto creado por estudiantes para estudiantes. **No es un proyecto oficial** de la universidad. No usamos el nombre institucional de forma que implique aval oficial.

---

## Tabla de contenidos

1. [Vision y objetivo](#vision-y-objetivo)
2. [Decisiones de producto (contexto acordado)](#decisiones-de-producto-contexto-acordado)
3. [Analisis de respuestas del fundador](#analisis-de-respuestas-del-fundador)
4. [Preguntas aclaradas](#preguntas-aclaradas-lo-que-no-entendias)
5. [Preguntas pendientes](#preguntas-pendientes-para-cerrar-diseno)
6. [Modelo de experiencia (UX)](#modelo-de-experiencia-ux)
7. [Arquitectura tecnica planificada](#arquitectura-tecnica-planificada)
8. [Equipo y roles sugeridos](#equipo-y-roles-sugeridos)
9. [Privacidad y datos personales](#privacidad-y-datos-personales)
10. [App movil vs web (analisis)](#app-movil-vs-web-analisis)
11. [Estado actual del codigo](#estado-actual-del-codigo-mayo-2026)
12. [Roadmap por fases](#roadmap-por-fases)
13. [Stack e instalacion](#stack-e-instalacion)
14. [Supabase (backend y datos)](#supabase-backend-y-datos)
15. [Despliegue en Vercel (produccion)](#despliegue-en-vercel-produccion)
16. [Documentacion tecnica](#documentacion-tecnica)

---

## Vision y objetivo

**Mision:** Democratizar el acceso a las chazas del campus. Que cualquier persona pueda descubrir que vende cada puesto, donde esta, a que precio y como contactar — sin depender del boca a boca.

**Modelo de negocio actual:** 100% gratuito. Sin comisiones ni pagos in-app. El valor es **descubrimiento y conexion** entre chazas y clientes.

**Monetizacion futura (solo si hay traccion):** Publicidad destacada para chazas (ej. aparecer primero en recomendados). No es prioridad del MVP.

**Alcance geografico:** Por ahora solo **sede Bogota** (campus UN). Arquitectura preparada para agregar sedes despues (`campus_id` en base de datos).

**Audiencia:** Abierto. **No se exige** ser estudiante UN ni verificar carnet. Cualquier persona puede usar la plataforma, registrar una chaza y dejar comentarios.

---

## Decisiones de producto (contexto acordado)

| Tema | Decision |
|------|----------|
| Sede | Solo Bogota (v1) |
| Unidad principal | **Chaza** con su propio **catalogo de productos/precios** |
| Vision IA (foto de carta → productos) | **Opcional (Fase 4):** Groq en servidor con `GROQ_API_KEY` + `ENABLE_MENU_VISION`; el usuario confirma antes de guardar |
| Exploracion | **Swiper tipo Tinder** como experiencia principal (no parrilla de todas las chazas) |
| Like | Alimenta **Recomendados** (tus likes + **cerca en el mapa**). Sin ranking “populares” en MVP |
| Guardar (bookmark) | Seccion **Mis guardadas** / favoritos |
| Pass (swiper) | **No oculta para siempre** — la chaza va al **final del mazo** (flashcards) |
| Visibilidad | **Igual para todas las chazas** en el explorador; estrellas/resenas solo como info extra |
| Productos al publicar | **Sin minimo** (ej. solo galletas); modo “subir carta” para negocios con muchos items (fase 2) |
| Categorias | Una chaza puede tener **varias categorias** |
| Mapa | Chazero **mueve su pin** sobre imagen del campus (`public/maps/`) |
| Comentarios | **Solo con cuenta** + filtro automatico de palabras ofensivas |
| Analytics | **Sin PII** para navegar; sesion anonima + eventos (tiempo en tarjeta, likes, paginas) para entregas |
| Metas | **30 chazas** mes 1, **50** mes 2; **QR** en puestos + incentivos a chazeros |
| Transacciones | Solo descubrimiento + contacto externo (WhatsApp, Instagram, presencial, etc.) |
| Chat in-app | **No** en el producto. No hay mensajeria dentro de la app |
| Mapa | **Si**, interactivo, pero **no fijo**: debe poder actualizarse (ver [Mapa del campus](#mapa-del-campus)) |
| Registro de chazas | Formulario completo → **publicacion automatica** (sin aprobacion manual) |
| Resenas | Usuario **registrado**; filtro profano automatico + reportes (admin) |
| Legal / UN | Proyecto publico independiente; sin usar nombre institucional de forma oficial |
| Admin | Por ahora solo el fundador tecnico |
| Blog | **Estatico** en codigo (`lib/constants/blog-posts.ts`), rutas `/blog` y `/blog/[slug]`; IA de articulos fuera de alcance del MVP |
| Auth | **Explorar swiper sin cuenta**; cuenta para like persistente, guardar, comentar, publicar chaza |
| Stack | **Supabase** + **Next.js** + **Vercel** |
| Idioma | Solo espanol |
| App nativa (iOS/Android) | Solo si hay traccion demostrada; ver analisis mas abajo |

---

## Analisis de respuestas del fundador

### Lo que quedo muy claro y bien alineado

1. **Swiper como core:** No es un detalle visual; es la estrategia de producto. Evita el “scroll infinito de 200 puestos” y prioriza chazas que **captan atencion**. El backend debe registrar `like`, `pass` y `save` para alimentar recomendados y guardados.

2. **Chaza + productos:** Aunque el swiper muestre la chaza como tarjeta, cada chaza tiene precios propios. El campo `price: "Desde $1.500"` del mock debe evolucionar a `MIN(precio productos activos)` o producto destacado.

3. **Gratis y sin friccion:** Sin pagos, sin verificacion estudiantil, sin cola de aprobacion. El riesgo se mueve a **calidad del contenido** (spam, chazas falsas, comentarios toxicos) → mitigar con diseno, no con burocracia.

4. **Equipo no tecnico = growth:** Los 5 companeros encajan naturalmente en operaciones de campo (registrar chazas en persona, marketing, relaciones con chazeros), no en codigo.

### Decisiones cerradas (ronda 2 — mayo 2026)

- **Analytics:** metricas de trafico y tiempo en swiper para presentaciones; no exigir datos personales para explorar.
- **Recomendados:** likes + proximidad en mapa; **no** populares globales.
- **Pass:** rotacion al final del mazo (implementado en `hooks/use-chaza-deck.ts`).
- **Mapa:** pin movible por chazero; plano UN pendiente en `public/maps/`.
- **Comentarios:** solo con cuenta; `lib/security/profanity.ts` + validacion servidor en fase Supabase.

### Decisiones cerradas (ronda 3)

| Tema | Decision |
|------|----------|
| Like / guardar | Modal **crear cuenta**; deslizar y pass **sin cuenta** |
| Blog | Solo **estetico** en landing; sin CMS ni IA en MVP |
| Incentivos chazeros | **Por definir** con el equipo de campo |
| Mapa | Plano UN en `public/maps/campus-bogota.png` + **enlaces a Google Maps**; ver [docs/MAPS.md](docs/MAPS.md) |
| Desarrollo sin DB | Si — mocks en `lib/constants/`, estado en cliente, analytics en sessionStorage |

### Pendiente menor

| Tema | Nota |
|------|------|
| **Incentivos chazeros** | QR en puestos; detalle cuando el equipo lo defina |
| **Contacto WhatsApp** | Opt-in con aviso de visibilidad publica |
| **Google Maps embebido** | Opcional con API key; ya funcionan enlaces externos |

### Correccion: “Chat in-app”

En la primera ronda de preguntas aparecia “chat entre usuarios” en el README original (heredado de v0). **Tu producto no lo necesita.** La conexion es:

```
Usuario descubre chaza → ve contacto / ubicacion → habla por WhatsApp o va al puesto
```

No construiremos mensajeria interna salvo que cambie la vision.

---

## Preguntas aclaradas (lo que no entendias)

### Pregunta 21: ¿Que es `EssenceSection`?

Es un **componente que ya existe en el codigo** pero **no aparece en la pagina principal**.

- Archivo: `components/landing/essence-section.tsx`
- Muestra 4 valores: COMUNIDAD, CONFIANZA, ECONOMIA, SOSTENIBLE
- Es una seccion de marketing (“nuestra esencia”), similar a “Como funciona”

**No es obligatorio.** Opciones:

| Opcion | Cuando usarla |
|--------|----------------|
| **Incluirla en la home** | Si quieres reforzar valores de marca entre “Como funciona” y “Comentarios” |
| **No incluirla** | Si la landing ya se siente larga; los valores ya estan implicitos en el hero |
| **Eliminar el archivo** | Si no la van a usar (menos codigo muerto) |

**Recomendacion:** No incluirla en v1 (landing ya tiene muchas secciones). Revisar textos: dice “miembros verificados de la UN” y eso **contradice** que la plataforma es abierta — habria que reescribir si se usa.

---

### Pregunta 22: ¿Swiper vs parrilla (grid)?

Eran **dos formas distintas** de mostrar el catalogo de chazas:

| Modo | Como se ve | Pros | Contras |
|------|------------|------|---------|
| **Swiper (Tinder)** | Una tarjeta a la vez, deslizar | Divertido, memorable, filtra por interes | No ves todas a la vez; malo si buscas algo especifico |
| **Parrilla / grid** | Muchas tarjetas en cuadricula | Comparar rapido, buscar por nombre | Abrumador; menos “descubrimiento” |

**Tu decision (correcta para el producto):** Swiper como experiencia **principal** en explorar.

Eso **no impide** tener ademas:

- Filtro por **categoria** (tap en “Cafe y Bebidas” → lista o swiper filtrado)
- **Busqueda** por nombre
- **Mapa** con pins
- Seccion **Recomendados** y **Guardadas** como listas mas clasicas

Es decir: swiper para descubrir; listas/mapas para volver a algo que ya te intereso.

---

## Preguntas pendientes (para cerrar diseno)

Responde cuando puedas (aunque sea breve). Esto desbloquea el esquema de base de datos y las pantallas.

### Exploracion y cuentas

1. **¿Hace falta crear cuenta para explorar el swiper**, o solo para like/guardar/comentar/publicar chaza?
2. **¿Los “pass” (deslizar izquierda) se guardan** para no mostrar la misma chaza otra vez en la misma sesion?
3. **Recomendados:** ¿mezcla de “por tus likes” + “populares esta semana” + “cerca de ti en el mapa”, o solo por likes?

### Chazas y productos

4. **Al registrar una chaza**, ¿cuantos productos minimo? (ej. al menos 3 items con nombre y precio)
5. **¿Una chaza puede tener varias categorias?** (ej. cafe + comida)
6. **¿Horario** como texto libre (“Lun-Vie 6am-3pm”) o selector por dia (para filtro “abierto ahora”)?
7. **Contacto obligatorio:** ¿WhatsApp, Instagram, telefono, o el chazero elige al menos uno?

### Mapa del campus

8. **¿Que significa “mapa no fijo” para ti?** Elige la mas cercana:
   - **A)** El chazero mueve su pin en un mapa base del campus
   - **B)** Solo zona textual (ej. “Plazoleta”, “Ingenieria piso 1”) sin coordenadas GPS
   - **C)** Coordenadas GPS pero el admin puede actualizar el plano del mapa cuando cambie el campus
9. **¿Tienen un plano/mapa base** (imagen o GeoJSON) del campus o hay que crearlo desde cero?

### Resenas y toxicidad

10. **¿Comentarios con nombre** (cuenta) o tambien anonimos?
11. **¿Sistema de reportar** comentario/chaza? (recomendado: si)
12. **¿Palabras ofensivas filtradas automaticamente** antes de publicar? (recomendado: si, lista basica)
13. **¿Un usuario puede editar/borrar su comentario** despues?

### Registro de chaza (baja friccion — recomendacion incluida)

14. **¿El chazero necesita cuenta antes del formulario** o “publicar primero, verificar email despues”?
15. **¿Quien puede editar la chaza despues?** Solo quien la creo (con su cuenta) — asumimos que si, confirmar.

### Blog IA

16. **¿Frecuencia del blog automatico?** (semanal, al haber N chazas nuevas, manual trigger)
17. **¿Temas del blog?** (nuevas chazas, rankings, tips emprendimiento, eventos campus)
18. **¿Quien revisa antes de publicar** o sale directo a la web?

### Operaciones (equipo de 5)

19. **¿Meta numerica para el lanzamiento?** (ej. 30 chazas registradas en el primer mes)
20. **¿Tendran WhatsApp/grupo** con chazeros para soporte?
21. **¿Material impreso o QR** en los puestos (“Encuentranos en ChazasUN”)?

### Marca y legal

22. **Nombre publico exacto:** ¿solo “Chazas UN” / “ChazasUN”? (evitar “Universidad Nacional” en dominio titular si preocupa)
23. **¿Edad minima** o disclaimer general en terminos?

---

## Modelo de experiencia (UX)

### Flujos principales

```
VISITANTE
  Landing → Explorar (swiper) → Like / Guardar / Pass
           → Mapa → Detalle chaza → Contacto externo
           → Categorias → Explorar filtrado
           → Recomendados (si hay likes previos)
           → Guardadas

CHAZERO
  Registro cuenta (baja friccion) → Formulario chaza → Publicada al instante
  → Panel: editar datos, productos, fotos, ubicacion en mapa, horarios, contacto

ADMIN (fundador)
  Moderar reportes, suspender chazas/comentarios toxicos, ver metricas basicas
```

### Registro de chaza — recomendacion (pregunta 20)

**Menor friccion:** wizard en una sola ruta `/publicar-chaza`

| Paso | Campos | Obligatorio |
|------|--------|-------------|
| 1. Cuenta | Email + contrasena (o magic link Google) | Si, al inicio o al final segun respuesta 14 |
| 2. Tu chaza | Nombre, categoria, descripcion corta, foto portada | Si |
| 3. Productos | Al menos 1 producto: nombre + precio (+ foto opcional) | Si (minimo 1) |
| 4. Ubicacion | Zona en mapa o texto + pin movible | Si (al menos texto) |
| 5. Contacto | WhatsApp o red social | Al menos uno |
| 6. Listo | Preview → Publicar | — |

No usar solo un ancla `#registro` en la landing (hoy **esta rota** — no existe esa seccion). CTA del hero y navbar → `/publicar-chaza`.

### Secciones de la app (mas alla de la landing)

| Ruta / seccion | Funcion |
|----------------|---------|
| `/` | Landing marketing (actual) |
| `/explorar` | Swiper con datos reales |
| `/recomendados` | Chazas segun likes + senales globales |
| `/guardadas` | Bookmarks del usuario |
| `/mapa` | Mapa interactivo campus |
| `/chazas/[slug]` | Detalle: productos, resenas, contacto |
| `/publicar-chaza` | Wizard registro |
| `/dashboard` | Panel del chazero |
| `/blog`, `/blog/[slug]` | Articulos estaticos |

---

## Arquitectura tecnica planificada

### Stack

| Capa | Tecnologia |
|------|------------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind 4, shadcn/ui |
| Backend | Supabase (PostgreSQL, Auth, Storage, Realtime solo si se necesita despues) |
| Hosting | Vercel |
| Validacion | Zod + react-hook-form |
| IA carta (opcional) | Groq vision (`lib/ai/groq-vision.ts`, `lib/actions/menu-vision.ts`) |
| Blog | Contenido estatico; tabla `blog_posts` solo si algun dia migra a CMS |

### Modelo de datos (resumen)

```
profiles          → usuario (opcional rol admin)
categories        → categorias de chazas
chazas            → puesto (owner, ubicacion, contacto, status published)
chaza_products    → nombre, precio, foto, disponible
chaza_images      → galeria
chaza_schedules   → horarios (ideal para "abierto ahora")
favorites         → guardados
swipe_events      → like | pass (para recomendados y no repetir)
reviews           → rating + comentario + moderacion
review_reports    → reportes de toxicidad
campus_map_config → capas/zonas del mapa (para mapa "no fijo")
blog_posts        → generados por IA
newsletter        → opcional
```

### Mapa del campus

Enfoque recomendado para “no fijo”:

1. **Mapa base** almacenado en Supabase Storage (imagen SVG/PNG del campus o tiles)
2. **Pins de chazas** con `lat`, `lng` editables por el chazero en su panel
3. **Version del mapa** (`map_version`) para que el admin suba un plano nuevo si el campus cambia sin romper pins (re-calibracion manual o por zonas)

Alternativa MVP mas barata: **solo zonas predefinidas** (lista de 20–30 puntos: “Plazoleta”, “Ciencias 214”) + pin aproximado. Mapa visual en fase 2.

### Vision de carta (opcional, Fase 4)

Con `ENABLE_MENU_VISION=true` y `GROQ_API_KEY`, el chazero puede subir una **foto de carta** en publicar/editar; el servidor sugiere productos (JSON) y el usuario **edita y guarda**. Sin persistir la imagen en analytics; limite por hora en `menu_vision_usage`. Ver [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md) y [`docs/SECURITY.md`](docs/SECURITY.md).

### Anti-toxicidad (recomendacion concreta)

Sin equipo de moderacion, usar **defensa en capas**:

1. Comentarios solo con **cuenta** (no anonimo)
2. **Rate limit** (ej. max 5 comentarios / hora por IP/usuario)
3. **Filtro de palabras** basicas (lista editable)
4. Boton **Reportar** → cola en panel admin
5. **Un comentario por usuario por chaza** (evita spam)
6. Opcional: resenas visibles solo despues de **3 reportes** los oculta hasta revision

### Autenticacion

- Supabase Auth: email/contrasena o magic link
- Sin verificacion @unal.edu.co
- RLS: cada quien edita su chaza; admin puede suspender

---

## Equipo y roles sugeridos

Equipo actual: **1 tecnico (tu) + 5 no tecnicos**.

| Rol sugerido | Personas | Responsabilidades |
|--------------|----------|-------------------|
| **Lider de campo / Chazas** | 2 | Ir puesto por puesto, explicar ChazasUN, ayudar a llenar formulario, seguimiento semanal |
| **Marketing / Comunidad** | 1–2 | Instagram/TikTok, historias de chazas, lanzamiento, posters con QR |
| **Operaciones / Datos** | 1 | Excel/Notion de chazas contactadas, estado (interesado / registrado / activo), feedback de chazeros |
| **Coordinacion general** | 1 (puede ser tu) | Prioridades semanales, reunion corta, puente con desarrollo |

**No necesitan programar.** Necesitan: guion de 30 segundos, QR a la web, formulario de feedback (Google Form) y lista de edificios/zonas del campus para el mapa.

---

## Privacidad y datos personales

Recomendacion para proyecto abierto y gratuito:

### Que mostrar publicamente en cada chaza

| Dato | Recomendacion |
|------|----------------|
| Nombre de la chaza | Publico |
| Productos y precios | Publico |
| Ubicacion (zona / pin) | Publico |
| Fotos | Publico |
| WhatsApp / Instagram | **Opcional** — el chazero decide; aviso: “visible para cualquier persona” |
| Nombre personal del dueno | **No publico por defecto** — solo nombre de la chaza |

### Cuentas de usuarios (quienes comentan / dan like)

- Perfil: nombre para mostrar (puede ser apodo), sin obligar nombre real
- Email: privado, nunca en API publica
- No pedir documento ni carnet

### Legal minimo antes de lanzar

- Pagina **Terminos de uso** (contenido generado por usuarios, no somos intermediarios de venta)
- Pagina **Privacidad** (que guardamos en Supabase, cookies, Vercel Analytics)
- Checkbox al registrarse: “Acepto terminos”

### Menores

Disclaimer: plataforma general; chazas son responsables de sus ventas. Sin recoger edad en MVP.

---

## App movil vs web (analisis)

| Opcion | Costo | Tiempo | Cuando |
|--------|-------|--------|--------|
| **Web responsive (actual)** | $0 extra | Ya en marcha | Ahora |
| **PWA** (“Agregar a inicio”) | Bajo | 1–2 dias | Tras MVP estable |
| **App nativa iOS + Android** | Alto (Apple $99/año, desarrollo, mantenimiento) | Meses | Solo con traccion clara |

**Recomendacion:** Invertir en **web mobile perfecta** (swiper ya funciona con touch). Medir usuarios recurrentes en Vercel Analytics. Si hay traccion, primero **PWA**, luego evaluar React Native o Capacitor envolviendo la web.

El swiper y el mapa funcionan bien en movil desde el navegador; eso cubre el 90% del uso en campus.

---

## Estado actual del codigo (mayo 2026)

Resumen: **Fases 0–4 cerradas en codigo**; **Fase 5.1–5.3** (compartir/QR, verificada, destacados) implementadas en codigo con Supabase. **Endurecimiento de seguridad** aplicado (redirect auth, uploads, validacion de contacto, CSP). La app funciona en local (puerto **3001**). **Deploy** opcional cuando quieras URL publica. Detalle: [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md), [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/SECURITY.md`](docs/SECURITY.md).

### Seguridad (code review, mayo 2026)

| Fix | Archivo / migracion |
|-----|---------------------|
| Open redirect en callback OAuth | `lib/security/safe-redirect.ts`, `app/auth/callback/route.ts` |
| Validacion MIME + magic bytes en portadas | `lib/security/image-magic-bytes.ts`, `lib/actions/upload-cover.ts` |
| WhatsApp / Instagram mas estrictos | `lib/validations/chaza.ts` |
| CHECK en `cover_image_url` | `supabase/migrations/20260521120000_chaza_cover_url_check.sql` |
| Content-Security-Policy (produccion) | `next.config.mjs` |

Guia completa: [`docs/SECURITY.md`](docs/SECURITY.md).

### Implementado

| Fase | Entregas principales |
|------|---------------------|
| **0** | App Router, swiper flashcards (pass al final del mazo), landing, legales, mapa base |
| **1** | Esquema SQL + RLS, auth, publicar chaza, explorar/detalle desde DB, favoritos, resenas, Storage portadas |
| **2** | Analytics en `analytics_events`, panel admin metricas, mapa y recomendados desde DB |
| **3** | Reportes (`content_reports`), moderacion admin, `/mis-chazas` + editar datos/pin/estado |
| **4** | Export **CSV** admin; **productos/carta** editables y visibles en detalle; vision **Groq** opcional; blog **`/blog/[slug]`**; cliente Supabase publico para SSG de `/chazas/[slug]` |
| **5.1–5.3** | **Compartir / QR** (`ChazaShareButton` en detalle y `/mis-chazas`); **verificada** (`verified_at`, admin **VERIFICAR**); **destacados** (`featured_until` / `featured_rank`, franja en `/explorar`, admin **DESTACADOS**) |

### Rutas relevantes

`/`, `/explorar`, `/mapa`, `/recomendados`, `/guardadas`, `/publicar-chaza`, `/mis-chazas`, `/mis-chazas/[slug]/editar`, `/chazas/[slug]`, `/blog`, `/blog/[slug]`, `/admin/metricas`, `/login`, `/registro`, `/terminos`, `/privacidad`.

### Migraciones Supabase (orden)

1. `20260218120000_init_schema.sql` — nucleo  
2. `20260220120000_storage_admin_analytics.sql` — bucket portadas, admin, politicas analytics  
3. `20260221120000_reports_moderation.sql` — reportes y moderacion  
4. `20260222120000_menu_vision_usage.sql` — limite vision carta (solo si usas Groq)
5. `20260518120000_profiles_oauth_display_name.sql` — trigger OAuth / nombre en `profiles`
6. `20260519120000_chazas_verified_at.sql` — `verified_at`, RPC y trigger admin
7. `20260520120000_chazas_featured.sql` — `featured_until`, `featured_rank`, RPC y trigger admin
8. `20260521120000_chaza_cover_url_check.sql` — CHECK en `cover_image_url` (solo https)

Orden: ejecuta en Supabase en ese orden si empiezas desde cero.

### Compartir enlace y QR (campo)

En la **ficha** `/chazas/[slug]` y en **Mis chazas**, el boton de compartir abre un dialogo: **copiar enlace**, **mensaje** listo para WhatsApp/IG y **descargar QR** (PNG). En **desarrollo** el enlace y el QR usan `http://localhost:3001`; solo sirven en tu equipo o red local. Cuando despliegues, configura **`NEXT_PUBLIC_SITE_URL`** en Vercel (misma URL publica) para que enlaces generados en SSR y QRs futuros apunten al dominio correcto.

### Siguiente (operacion)

**Fase 5.4:** deploy Vercel, URLs Auth y smoke en produccion. Ejecutar migracion `20260521120000_chaza_cover_url_check.sql` en Supabase si aun no esta aplicada. Ver **[`docs/FASE_5_PLAN.md`](docs/FASE_5_PLAN.md)** y **[`docs/VERCEL_DEPLOY.md`](docs/VERCEL_DEPLOY.md)**.

### Deuda menor (no bloqueante)

- Componente `EssenceSection` sin usar en la home (ver [Pregunta 21](#pregunta-21-qué-es-essencesection)).
- Refinar recomendados (distancia/geo en `lib/data/recommendations.ts`) segun feedback.

### Estructura del repositorio

Arbol y convenciones: **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

---

## Roadmap por fases

Checklist vivo: [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md). **Siguiente:** [`docs/FASE_5_PLAN.md`](docs/FASE_5_PLAN.md).

**Planificación en el tiempo (8 semanas, sin IA en código):** [`docs/CALENDARIO_8_SEMANAS.md`](docs/CALENDARIO_8_SEMANAS.md) — semanas 1–6 desarrollo alineado a Fases 0–5; semanas 7–8 marketing y publicidad en campus.

### Fase 0 — Estructura frontend

- [x] Carpetas, rutas, swiper flashcards, analytics base
- [x] Plano campus + componente mapa

### Fase 1 — Supabase core (datos)

- [x] Esquema, RLS, auth, seed demo (`pnpm db:seed`)
- [x] CRUD publicar chaza, explorar desde DB, likes/guardados, resenas
- [x] Storage imagenes (portadas)
- [x] Panel admin sobre datos reales

### Fase 2 — Produccion, mapa y metricas

- [x] Analytics en `analytics_events`, panel admin
- [x] Mapa y metadata/slugs (evolucion continua en recomendados)
- Ver [`docs/FASE_2_PLAN.md`](docs/FASE_2_PLAN.md)

### Fase 3 — Comunidad y admin

- [x] Reportes de contenido, moderacion, `/mis-chazas`

### Fase 4 — Contenido, metricas exportables e IA opcional

- [x] Export CSV admin, productos/carta, vision Groq opcional, blog por slug
- Ver [`docs/FASE_4_PLAN.md`](docs/FASE_4_PLAN.md)

### Fase 5 — Campo y crecimiento

- [x] 5.1–5.3 en codigo (compartir/QR, verificada, destacados). Ver [`docs/FASE_5_PLAN.md`](docs/FASE_5_PLAN.md)
- [ ] 5.4 Deploy y smoke produccion

---

## Stack e instalacion

### Tecnologias

- **Framework**: Next.js 16 (App Router)
- **Estilos**: Tailwind CSS 4
- **Componentes UI**: shadcn/ui
- **Tipografia**: DM Sans + Barlow Condensed
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Deploy**: Vercel

### Paleta de colores

| Color | Hex | Uso |
|-------|-----|-----|
| Rojo principal | `#A31E1E` | Marca, CTAs |
| Rojo oscuro | `#7A1515` | Hover, sombras |
| Blanco | `#FFFFFF` | Fondos |
| Gris claro | `#F5F5F5` | Fondos secundarios |

### Instalacion local

```bash
git clone https://github.com/sebastianvelace/ChazasUN-1.1.git
cd ChazasUN-1.1
pnpm install
cp .env.example .env.local   # Rellenar claves Supabase
pnpm dev
```

Abrir [http://localhost:3001](http://localhost:3001).

Con Supabase configurado, ejecuta **una vez** `pnpm db:seed` (ver [Supabase](#supabase-backend-y-datos)).

### Scripts

```bash
pnpm dev      # Desarrollo (puerto 3001)
pnpm build    # Build produccion
pnpm start    # Servidor produccion
pnpm lint     # Linter
pnpm db:seed  # Importar 14 chazas demo (requiere service role en .env.local)
```

---

## Supabase (backend y datos)

Migraciones SQL en `supabase/migrations/`. Clientes Next.js en `lib/supabase/` (`client`, `server`, `admin`, `middleware`).

### Inicio rapido

1. Crea proyecto en [supabase.com](https://supabase.com).
2. Copia **Project URL** y **anon key** a `.env.local` (plantilla en `.env.example`).
3. Ejecuta las migraciones en orden (inicial + Fase 2–4 segun necesites); la guia lista cada archivo en [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md).
4. Opcional local: `SUPABASE_SERVICE_ROLE_KEY` solo para `pnpm db:seed` (no exponer al cliente).
5. Configura **Site URL** `http://localhost:3001` y redirect `http://localhost:3001/auth/callback`.

Guia paso a paso: [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md). Seguridad y RLS: [`docs/SECURITY.md`](docs/SECURITY.md).

**Desplegar en internet (Vercel):** guia larga y orden recomendado en [`docs/VERCEL_DEPLOY.md`](docs/VERCEL_DEPLOY.md) — incluye Auth, Google OAuth, URLs de redireccion y smoke test.

---

## Despliegue en Vercel (produccion)

No hace falta desplegar “antes” que desarrollar en local: lo normal es **configurar Supabase**, trabajar en `http://localhost:3001`, y cuando quieras una **URL publica** seguir la guia de deploy.

**¿Tiene sentido subir a Vercel pronto?** Si — cuando necesites compartir el enlace, probar en moviles de otras personas o cerrar la configuracion de OAuth con un dominio estable.

Pasos detallados (migraciones, variables `NEXT_PUBLIC_*`, **Site URL** y **Redirect URLs** en Supabase, Google Cloud, pruebas despues del deploy): **[`docs/VERCEL_DEPLOY.md`](docs/VERCEL_DEPLOY.md)**.

---

## Documentacion tecnica

| Documento | Contenido |
|-----------|-----------|
| [`docs/INFORME_ACADEMICO.md`](docs/INFORME_ACADEMICO.md) | **Informe académico técnico** — 10 secciones (abstract, diseño, pruebas, viabilidad, referencias IEEE) |
| [`docs/GUIA_COMPLETA.md`](docs/GUIA_COMPLETA.md) | **Guía completa del proyecto** — arquitectura, flujos, seguridad y FAQ para externos |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Carpetas, rutas, flujo de datos |
| [`docs/CALENDARIO_8_SEMANAS.md`](docs/CALENDARIO_8_SEMANAS.md) | **Calendario 8 semanas** (desarrollo sin IA + marketing semanas 7–8) |
| [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md) | Fases 0–5, checklists |
| [`docs/FASE_2_PLAN.md`](docs/FASE_2_PLAN.md) | Plan Fase 2 (referencia historica) |
| [`docs/FASE_3_PLAN.md`](docs/FASE_3_PLAN.md) | Plan Fase 3 (moderacion, mis-chazas) |
| [`docs/FASE_4_PLAN.md`](docs/FASE_4_PLAN.md) | Plan Fase 4 (CSV, carta, Groq, blog) |
| [`docs/FASE_5_PLAN.md`](docs/FASE_5_PLAN.md) | **Siguiente:** QR, verificada, destacados, ops |
| [`docs/VERCEL_DEPLOY.md`](docs/VERCEL_DEPLOY.md) | **Deploy Vercel + Supabase Auth** (paso a paso, Google, URLs, troubleshooting) |
| [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md) | Variables, migraciones, seed, auth |
| [`docs/MAPS.md`](docs/MAPS.md) | Mapa del campus |
| [`docs/SECURITY.md`](docs/SECURITY.md) | RLS, privacidad, vision Groq |

### Desarrollo con v0

Repositorio vinculado a [v0](https://v0.app). Merge a `main` despliega en Vercel.

---

## Historial de decisiones

| Fecha | Decision |
|-------|----------|
| 2026-05 | Documento de contexto consolidado con respuestas del fundador |
| 2026-05 | Endurecimiento de seguridad: redirect auth, uploads, contacto, CSP, CHECK portada |
| 2026-05 | Fase 4 en codigo: CSV admin, carta de productos, blog estatico por slug, vision carta opcional (Groq) |
| — | Solo sede Bogota; plataforma abierta; sin chat in-app; swiper como UX principal |
| — | Supabase + Vercel; blog estatico en MVP; siguiente foco operativo: Fase 5 (QR, confianza, campo) |

---

## Contribuidores

Proyecto desarrollado por estudiantes de la Universidad Nacional de Colombia (iniciativa independiente).

**Equipo:** 1 desarrollo + 5 operaciones/marketing/campo (roles por definir en reunion).

---

*Este README es la fuente de verdad del producto y la arquitectura. La **hoja de ruta tecnica** vive en [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md) y [`docs/FASE_5_PLAN.md`](docs/FASE_5_PLAN.md).*

# Guía completa de ChazasUN

Documento técnico y funcional del proyecto, pensado para que **cualquier persona externa** (profesor, revisor, inversionista, desarrollador nuevo) entienda qué es la plataforma, cómo funciona y cómo está protegida.

**Documentos relacionados:** [`README.md`](../README.md) (visión de producto) · [`ARCHITECTURE.md`](ARCHITECTURE.md) · [`SECURITY.md`](SECURITY.md) · [`BUILD_PLAN.md`](BUILD_PLAN.md) · [`VERCEL_DEPLOY.md`](VERCEL_DEPLOY.md)

---

## Tabla de contenidos

1. [¿Qué es ChazasUN?](#1-qué-es-chazasun)
2. [Problema y solución](#2-problema-y-solución)
3. [Experiencia del usuario](#3-experiencia-del-usuario)
4. [Arquitectura general](#4-arquitectura-general)
5. [Stack tecnológico](#5-stack-tecnológico)
6. [Estructura del repositorio](#6-estructura-del-repositorio)
7. [Modelo de datos](#7-modelo-de-datos)
8. [Rutas de la aplicación](#8-rutas-de-la-aplicación)
9. [Flujos principales](#9-flujos-principales)
10. [Autenticación y sesiones](#10-autenticación-y-sesiones)
11. [Seguridad en profundidad](#11-seguridad-en-profundidad)
12. [Privacidad y datos personales](#12-privacidad-y-datos-personales)
13. [Moderación de contenido](#13-moderación-de-contenido)
14. [Analytics y métricas](#14-analytics-y-métricas)
15. [Almacenamiento de imágenes](#15-almacenamiento-de-imágenes)
16. [Panel de administración](#16-panel-de-administración)
17. [Modo desarrollo vs producción](#17-modo-desarrollo-vs-producción)
18. [Variables de entorno](#18-variables-de-entorno)
19. [Instalación desde cero](#19-instalación-desde-cero)
20. [Estado actual y roadmap](#20-estado-actual-y-roadmap)
21. [FAQ para personas externas](#21-faq-para-personas-externas)

---

## 1. ¿Qué es ChazasUN?

**ChazasUN** es una plataforma web gratuita que conecta a visitantes del campus de la Universidad Nacional de Colombia (sede Bogotá) con **chazas**: puestos informales de comida, servicios, papelería, libros, etc.

No es un proyecto oficial de la universidad. Es una iniciativa estudiantil independiente.

**Qué hace la plataforma:**

- Permite **descubrir** chazas con un explorador tipo Tinder (swiper).
- Muestra **ubicación** en un mapa interactivo del campus.
- Ofrece **ficha detallada** de cada chaza: productos, precios, horarios, contacto.
- Permite a emprendedores **publicar y gestionar** su puesto.
- Recoge **reseñas** y **likes** para recomendaciones personalizadas.

**Qué NO hace:**

- No procesa pagos ni comisiones.
- No tiene chat interno (el contacto es externo: WhatsApp, Instagram, presencial).
- No exige carnet universitario ni verificación institucional.
- No vende datos de usuarios.

---

## 2. Problema y solución

### Problema

En el campus, la información sobre chazas circula por boca a boca, grupos de WhatsApp o señales físicas. No existe un catálogo centralizado, actualizado y accesible desde el móvil.

### Solución

Un marketplace web **mobile-first** donde:

| Actor | Beneficio |
|-------|-----------|
| **Visitante** | Descubre chazas deslizando, las guarda, las ve en mapa y deja reseñas |
| **Chazero** | Publica su puesto gratis, edita datos, comparte QR/enlace |
| **Equipo** | Métricas de uso, moderación de reportes, chazas verificadas |

### Principios de producto

- **Igual visibilidad** en el explorador: ninguna chaza paga por aparecer primero en el mazo del swiper.
- **Pass no oculta para siempre**: al deslizar izquierda, la chaza va al final del mazo (como flashcards).
- **Explorar sin cuenta**; like, guardar, reseñar y publicar **requieren registro**.
- **100 % gratuito** para usuarios y chazeros en el MVP.

---

## 3. Experiencia del usuario

### Visitante (sin cuenta)

```
Landing → Swiper (like/pass) → Detalle chaza → Contacto externo
       → Mapa con pins
       → Filtrar por categoría
```

- Puede navegar, deslizar y pasar chazas **sin registrarse**.
- Al intentar **like** o **guardar**, aparece un modal pidiendo crear cuenta.

### Usuario registrado

```
Registro → Like / Guardar → Recomendados / Guardadas
        → Reseña en detalle
        → Reportar contenido inapropiado
```

### Chazero (dueño de chaza)

```
Registro → Wizard /publicar-chaza → Chaza publicada al instante
        → /mis-chazas → Editar datos, pin, productos, estado
        → Compartir enlace + QR de su ficha
```

### Administrador

```
/admin/metricas → Métricas, export CSV, cola de reportes
               → Verificar chazas, destacados temporales
```

---

## 4. Arquitectura general

### Diagrama de capas

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (navegador)                       │
│  Next.js App Router · React 19 · Tailwind · shadcn/ui       │
│  Componentes cliente (swiper, mapa) + Server Components      │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVIDOR (Vercel / Node)                  │
│  Server Actions · Route Handlers · Middleware (sesión)       │
│  Validación Zod · Lógica de negocio · Admin checks           │
└──────────────────────────┬──────────────────────────────────┘
                           │ Supabase client (anon key + JWT)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (BaaS)                           │
│  PostgreSQL + RLS · Auth · Storage · (opcional) Realtime     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼ (opcional)
┌─────────────────────────────────────────────────────────────┐
│                    GROQ API (solo servidor)                    │
│  Vision de carta → sugerir productos (si ENABLE_MENU_VISION) │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de una petición típica

```
1. Usuario hace clic en "Publicar reseña"
2. Componente cliente envía datos a createReviewAction (Server Action)
3. Servidor valida con Zod + checkProfanity()
4. Servidor obtiene usuario de sesión JWT (Supabase)
5. INSERT en tabla reviews (PostgreSQL)
6. RLS verifica: user_id = auth.uid()
7. revalidatePath() actualiza la página de detalle
8. Cliente ve la reseña tras recarga/navegación
```

### Principios arquitectónicos

| Principio | Implementación |
|-----------|----------------|
| Separación UI / lógica | Hooks + Server Actions; no SQL en componentes |
| Seguridad en servidor | Toda mutación pasa por Server Action con auth |
| Defensa en profundidad | Zod + RLS + validación duplicada (cliente/servidor) |
| Sin PII en analytics de navegación | UUID anónimo en sessionStorage |
| Colocation | Componentes por dominio (`components/chazas`, `components/map`) |

---

## 5. Stack tecnológico

| Capa | Tecnología | Versión / nota |
|------|------------|----------------|
| Framework | Next.js (App Router) | 16.x |
| UI | React | 19 |
| Estilos | Tailwind CSS | 4 |
| Componentes | shadcn/ui | Radix + Tailwind |
| Backend | Supabase | PostgreSQL, Auth, Storage |
| Validación | Zod + react-hook-form | Schemas en `lib/validations/` |
| Hosting | Vercel | HTTPS automático |
| IA opcional | Groq Vision | Solo servidor, carta de productos |
| Lenguaje | TypeScript | Strict en todo el repo |

---

## 6. Estructura del repositorio

```
ChazasUN-1.1/
├── app/                          # Rutas Next.js (App Router)
│   ├── (marketing)/              # Landing, términos, privacidad
│   ├── (platform)/               # App: explorar, mapa, chazas, admin
│   ├── (auth)/                   # Login, registro, recuperar contraseña
│   ├── auth/callback/            # OAuth / magic link callback
│   ├── layout.tsx                # Layout raíz
│   └── globals.css               # Estilos globales + animaciones
│
├── components/
│   ├── landing/                  # Secciones de la home
│   ├── chazas/                   # Swiper, cards, detalle, QR
│   ├── map/                      # Mapa del campus
│   ├── layout/                   # Headers, shells
│   ├── auth/                     # Diálogos de auth
│   └── ui/                       # shadcn (botones, dialogs, etc.)
│
├── config/
│   ├── site.ts                   # URLs, metas, principios de producto
│   └── categories.ts             # 13 categorías con iconos y colores
│
├── hooks/                        # useSession, useFavorites, useChazaDeck…
├── types/                        # ChazaCard, Review, Analytics…
│
├── lib/
│   ├── actions/                  # Server Actions (mutaciones)
│   ├── supabase/                 # Clientes browser, server, admin
│   ├── validations/              # Schemas Zod
│   ├── security/                 # Filtro profanidad
│   ├── analytics/                # Tracking anónimo
│   ├── ai/                       # Groq vision (servidor)
│   ├── admin/                    # requireAdminSession()
│   └── data/                     # Repositorios, mappers, recomendaciones
│
├── supabase/migrations/          # SQL versionado (7 migraciones)
├── public/maps/                  # Plano campus (PNG)
└── docs/                         # Documentación técnica
```

---

## 7. Modelo de datos

### Tablas principales (PostgreSQL)

```
auth.users          ← Supabase Auth (email, OAuth)
    │
    └── profiles    ← display_name, avatar_url, is_admin
            │
            ├── chazas              ← puesto del chazero
            │     ├── chaza_categories
            │     ├── chaza_products
            │     └── reviews
            │
            └── favorites           ← like | save

categories          ← catálogo fijo (13 categorías)
analytics_events    ← métricas anónimas
content_reports     ← reportes de moderación
menu_vision_usage   ← límite IA carta (opcional)
```

### Tabla `chazas` (campos clave)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `owner_id` | UUID | Dueño (FK profiles) |
| `slug` | text | URL única `/chazas/[slug]` |
| `status` | enum | `draft`, `published`, `paused`, `suspended` |
| `map_position` | jsonb | Pin en plano campus `{x, y}` % |
| `geo` | jsonb | Coordenadas derivadas para mapa |
| `contact_whatsapp` | text | Opt-in, visible públicamente |
| `verified_at` | timestamptz | Badge verificada (admin) |
| `featured_until` | timestamptz | Destacado temporal (admin) |

### Tabla `favorites`

| Campo | Valores |
|-------|---------|
| `kind` | `like` o `save` |
| PK | `(user_id, chaza_id, kind)` |

### Tabla `reviews`

- **Una reseña por usuario por chaza** (constraint UNIQUE).
- `rating`: 1–5 estrellas.
- `status`: `published`, `hidden`, `pending`.

---

## 8. Rutas de la aplicación

| Ruta | Acceso | Función |
|------|--------|---------|
| `/` | Público | Landing + swiper embebido |
| `/explorar` | Público | Swiper completo + búsqueda + destacados |
| `/mapa` | Público | Mapa interactivo + filtro categoría/likes |
| `/recomendados` | Login | Chazas según likes + cercanía en mapa |
| `/guardadas` | Login | Bookmarks del usuario |
| `/chazas/[slug]` | Público | Detalle, productos, reseñas, reportar |
| `/publicar-chaza` | Login | Wizard de publicación |
| `/mis-chazas` | Login | Lista del dueño + QR/compartir |
| `/mis-chazas/[slug]/editar` | Login (dueño) | Edición completa |
| `/blog`, `/blog/[slug]` | Público | Artículos estáticos |
| `/admin/metricas` | Admin | Métricas, CSV, reportes, verificar |
| `/login`, `/registro` | Público | Auth email + Google OAuth |
| `/terminos`, `/privacidad` | Público | Legales |

---

## 9. Flujos principales

### 9.1 Explorador (swiper)

**Archivos:** `components/chazas/chaza-swiper.tsx`, `hooks/use-chaza-deck.ts`, `hooks/use-chaza-catalog.ts`

```
1. Carga chazas desde Supabase (SSR en home) o hook en cliente
2. Mazo inicial = todas las chazas filtradas
3. Usuario desliza:
   - Derecha (like) → requiere login → favorito + rota al final
   - Izquierda (pass) → rota al final (sin login)
4. Undo restaura snapshot del mazo
5. Guardar (bookmark) → requiere login
```

**Regla de negocio:** el pass **nunca elimina** una chaza del mazo; solo la mueve al final.

### 9.2 Publicar chaza

**Archivos:** `app/(platform)/publicar-chaza/`, `lib/actions/publish-chaza.ts`

```
1. Usuario autenticado completa wizard (Zod client-side)
2. publishChazaAction valida de nuevo en servidor
3. Genera slug único (reintento si colisión)
4. INSERT chazas + chaza_categories + chaza_products
5. RLS: owner_id = auth.uid()
6. status = 'published' (publicación automática, sin cola admin)
7. revalidatePath → aparece en explorar
```

### 9.3 Reseñas

**Archivos:** `lib/actions/reviews.ts`, `lib/security/profanity.ts`

```
1. Usuario autenticado envía rating + texto
2. reviewSchema (Zod) valida longitud y rating
3. checkProfanity() filtra palabras ofensivas
4. INSERT reviews (UNIQUE por chaza+usuario)
5. Reseñas visibles solo si status = 'published'
```

### 9.4 Recomendados

**Archivo:** `lib/data/recommendations.ts`

```
1. Chazas con like del usuario (orden de likes)
2. Ancla geográfica = última chaza likeada con pin, o centro campus
3. Resto ordenado por distancia euclidiana en el plano del mapa
4. Sin ranking por "populares globales"
```

### 9.5 Reportes y moderación

```
1. Usuario autenticado reporta chaza o reseña
2. INSERT content_reports
3. Admin ve cola en /admin/metricas
4. Acciones: descartar, ocultar reseña, suspender chaza
```

---

## 10. Autenticación y sesiones

### Métodos soportados

| Método | Estado |
|--------|--------|
| Email + contraseña | ✅ |
| Google OAuth | ✅ |
| Recuperar contraseña | ✅ |
| Magic link | Según config Supabase |

### Flujo OAuth

```
1. Usuario clic "Continuar con Google"
2. Redirect a Supabase Auth → Google
3. Callback a /auth/callback?code=...
4. exchangeCodeForSession() → cookies httpOnly
5. Redirect a /explorar (o next param)
```

### Middleware de sesión

**Archivo:** `middleware.ts` → `lib/supabase/middleware.ts`

- Se ejecuta en **casi todas las rutas** (excepto assets estáticos).
- Refresca el JWT de Supabase en cada request.
- Escribe cookies de sesión en la respuesta.

### Modo demo (sin Supabase)

Si no hay `NEXT_PUBLIC_SUPABASE_URL` en `.env`:

- Sesión simulada en `localStorage` (`chazasun_mock_session`).
- Favoritos y chazas publicadas en `localStorage`.
- Útil para desarrollo UI sin backend.

---

## 11. Seguridad en profundidad

### 11.1 Row Level Security (RLS)

**Todas las tablas con datos de usuario tienen RLS activado.** Las políticas principales:

| Tabla | Regla |
|-------|-------|
| `chazas` | Lectura: publicadas O propias. Escritura: solo dueño |
| `favorites` | Solo el propio usuario ve/modifica sus favoritos |
| `reviews` | Lectura: publicadas. Escritura: solo autor |
| `analytics_events` | Insert: todos. Select: solo admins |
| `content_reports` | Insert: autenticados. Select/update: admins |
| `profiles` | Lectura: todos. Update: solo propio perfil |

**Implicación:** aunque alguien obtenga la `anon key` del frontend, **no puede** leer favoritos ajenos ni editar chazas de otros usuarios gracias a RLS.

### 11.2 Validación en servidor

Toda mutación pasa por **Server Actions** con:

1. `safeParse()` de schema Zod.
2. `supabase.auth.getUser()` para identidad.
3. INSERT/UPDATE sujeto a RLS.

**Nunca se confía solo en validación del cliente.**

### 11.3 Claves y secretos

| Variable | ¿Exponer al cliente? | Uso |
|----------|---------------------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Sí | URL del proyecto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Sí | Clave pública (limitada por RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ **Nunca** | Solo local: `pnpm db:seed` |
| `GROQ_API_KEY` | ❌ **Nunca** | Solo Server Actions |
| `ADMIN_USER_IDS` | ❌ **Nunca** | Solo servidor |

### 11.4 Autenticación admin

Doble verificación en `lib/admin/require-admin.ts`:

1. Usuario autenticado con JWT válido.
2. `profiles.is_admin = true` **O** UUID en `ADMIN_USER_IDS` (env servidor).

Las Server Actions de admin (`analytics`, `reports`, `verify`, `featured`) llaman `requireAdminSession()` antes de cualquier operación.

### 11.5 Cookies de sesión

- Gestionadas por `@supabase/ssr`.
- `httpOnly` en producción (no accesibles desde JavaScript malicioso).
- HTTPS forzado en Vercel.

### 11.6 Storage (imágenes)

Bucket `chaza-covers`:

- **Lectura pública** (portadas visibles en la web).
- **Escritura:** solo en carpeta `{user_id}/` del usuario autenticado.
- Límite: 5 MB por archivo.
- MIME permitidos: JPEG, PNG, WebP, GIF.

### 11.7 Filtro de profanidad

- Lista curada en `lib/security/profanity.ts`.
- Validación en **cliente y servidor** al crear reseña.
- Palabras detectadas se censuran con asteriscos.

### 11.8 Rate limiting

| Área | Estado |
|------|--------|
| Reseñas | Constraint UNIQUE (1 por chaza/usuario) |
| Vision carta Groq | Tabla `menu_vision_usage` con límite horario |
| Analytics insert | Abierto (considerar límite en producción) |

### 11.9 HTTPS y headers

- Vercel provee TLS automático.
- No hay datos de tarjeta de crédito (no hay pagos).

### 11.10 Visión IA (Groq) — consideraciones

Si `ENABLE_MENU_VISION=true`:

- La **foto de carta** se envía al API de Groq desde el **servidor**.
- La imagen **no se persiste** en ChazasUN ni en analytics.
- El usuario **confirma** productos sugeridos antes de guardar.
- Revisar términos de retención de Groq para cumplimiento legal.

---

## 12. Privacidad y datos personales

### Qué NO se pide para navegar

- Nombre real
- Documento / carnet
- Email (solo para swiper/explorar)

### Qué SÍ se almacena

| Dato | Cuándo | Dónde | ¿Público? |
|------|--------|-------|----------|
| Email | Registro | Supabase Auth | ❌ Privado |
| display_name | Registro / OAuth | profiles | ✅ Visible en reseñas |
| Likes / guardados | Con cuenta | favorites | ❌ Solo el usuario |
| Reseñas | Con cuenta | reviews | ✅ Públicas |
| Chaza (nombre, productos, ubicación) | Publicar | chazas | ✅ Públicas |
| WhatsApp / Instagram | Opt-in chazero | chazas | ✅ Públicos si el chazero los pone |
| session_id UUID | Siempre (analytics) | analytics_events | ❌ Anónimo, sin email |

### Contacto del chazero

- El chazero **elige** si publicar WhatsApp o Instagram.
- Se muestra aviso de que será **visible para cualquier persona**.

### Páginas legales

- `/terminos` — términos de uso
- `/privacidad` — qué datos se guardan y dónde
- Checkbox de aceptación al registrarse

---

## 13. Moderación de contenido

### Capas de defensa

```
1. Cuenta obligatoria para reseñar
2. Filtro automático de palabras ofensivas
3. Una reseña por usuario por chaza (anti-spam)
4. Botón "Reportar" en detalle
5. Cola admin: ocultar reseña / suspender chaza
6. Badge "verificada" (validación humana del equipo)
```

### Estados de chaza

| Status | Significado |
|--------|-------------|
| `published` | Visible en explorar |
| `draft` | Solo dueño |
| `paused` | Dueño la pausó temporalmente |
| `suspended` | Admin la suspendió por moderación |

---

## 14. Analytics y métricas

### Eventos registrados

| Evento | Cuándo |
|--------|--------|
| `page_view` | Cambio de ruta |
| `swiper_like` | Like en swiper |
| `swiper_pass` | Pass en swiper |
| `swiper_card_time` | Tiempo viendo una tarjeta |
| `auth_prompt_shown` | Modal de login |

### Identificador de sesión

- UUID aleatorio en `sessionStorage` (`chazasun_analytics_session`).
- **No contiene** email, nombre ni IP en el payload.
- Se envía a `analytics_events` vía Server Action.

### Panel admin

- Agregados: likes, passes, tiempo medio, páginas visitadas.
- Export **CSV** para entregas académicas.
- Solo accesible con permisos admin.

---

## 15. Almacenamiento de imágenes

```
Usuario sube portada
    → uploadChazaCoverAction (servidor)
    → Supabase Storage bucket "chaza-covers"
    → Path: {user_id}/{timestamp}.{ext}
    → URL pública guardada en chazas.cover_image_url
```

- Sin Supabase: placeholder Unsplash o URL manual.
- Tamaño máximo: 5 MB.
- Formatos: JPEG, PNG, WebP, GIF.

---

## 16. Panel de administración

**Ruta:** `/admin/metricas`

| Función | Descripción |
|---------|-------------|
| Métricas | Conteos DB + eventos analytics |
| Export CSV | Descarga `analytics_events` |
| Reportes | Cola de `content_reports` |
| Verificar | Marca `verified_at` en chaza |
| Destacados | `featured_until` + `featured_rank` |

**Acceso:** `profiles.is_admin = true` o UUID en `ADMIN_USER_IDS`.

---

## 17. Modo desarrollo vs producción

| Aspecto | Desarrollo (`pnpm dev`) | Producción (Vercel) |
|---------|-------------------------|---------------------|
| URL | `http://localhost:3001` | `https://*.vercel.app` |
| Supabase | Mismo proyecto o local | Proyecto Supabase producción |
| Auth redirects | `localhost:3001/auth/callback` | URL Vercel en Supabase dashboard |
| QR / enlaces | Apuntan a localhost | `NEXT_PUBLIC_SITE_URL` |
| Service role | Solo local para seed | **No** en Vercel |
| Mock fallback | Sin env Supabase → localStorage | Siempre Supabase |

---

## 18. Variables de entorno

Ver `.env.example`:

```bash
# Obligatorias (producción y desarrollo con DB)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Opcionales
NEXT_PUBLIC_SITE_URL=https://tu-dominio.vercel.app   # QR y enlaces SSR
ADMIN_USER_IDS=uuid1,uuid2                           # Admin alternativo
SUPABASE_SERVICE_ROLE_KEY=...                        # Solo local, seed
ENABLE_MENU_VISION=true                              # IA carta
GROQ_API_KEY=...                                     # Solo servidor
```

**Regla:** nunca commitear `.env.local` al repositorio.

---

## 19. Instalación desde cero

### Requisitos

- Node.js 20+
- pnpm
- Cuenta Supabase (gratis)

### Pasos

```bash
git clone https://github.com/sebastianvelace/ChazasUN-1.1.git
cd ChazasUN-1.1
pnpm install
cp .env.example .env.local
# Rellenar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Supabase

1. Crear proyecto en [supabase.com](https://supabase.com).
2. Ejecutar migraciones en orden (`supabase/migrations/*.sql`).
3. Configurar Auth: Site URL `http://localhost:3001`, Redirect `http://localhost:3001/auth/callback`.
4. (Opcional) `pnpm db:seed` con `SUPABASE_SERVICE_ROLE_KEY` para 14 chazas demo.

Guía detallada: [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md)

### Arrancar

```bash
pnpm dev
# → http://localhost:3001
```

### Build de producción

```bash
pnpm build
pnpm start
```

Deploy: [`VERCEL_DEPLOY.md`](VERCEL_DEPLOY.md)

---

## 20. Estado actual y roadmap

### Implementado (~95 % software)

| Fase | Entregas |
|------|----------|
| 0 | Frontend, swiper, landing, mapa base |
| 1 | Supabase, auth, publicar, favoritos, reseñas |
| 2 | Analytics DB, mapa pins, admin métricas |
| 3 | Reportes, moderación, mis-chazas |
| 4 | CSV, productos/carta, blog, Groq opcional |
| 5.1–5.3 | QR/compartir, verificada, destacados |

### Pendiente

- Deploy Vercel + smoke test producción
- Integración Jetson Orin Nano (análisis emocional reseñas — plan académico)
- Campo: registrar 30–50 chazas reales en campus

Detalle: [`BUILD_PLAN.md`](BUILD_PLAN.md) · [`INFORME_PROYECTO_CLASE.md`](INFORME_PROYECTO_CLASE.md)

---

## 21. FAQ para personas externas

### Sobre el producto

**¿Es oficial de la Universidad Nacional?**  
No. Es un proyecto estudiantil independiente. No implica aval institucional.

**¿Cobra comisiones o procesa pagos?**  
No. La plataforma es 100 % gratuita. Las transacciones ocurren fuera (presencial, WhatsApp, etc.).

**¿Necesito ser estudiante UN para usarla?**  
No. Está abierta a cualquier visitante del campus.

**¿Por qué un swiper y no una lista?**  
Para evitar scroll infinito con cientos de puestos. El swiper prioriza descubrimiento; listas y mapa complementan para búsqueda específica.

**¿Un "pass" oculta la chaza para siempre?**  
No. Va al **final del mazo** y puede volver a aparecer (modelo flashcards).

**¿Las chazas populares aparecen primero?**  
No en el mazo principal. Las estrellas son información en detalle, no afectan el orden del explorador.

---

### Sobre seguridad

**¿Puedo hackear likes o reseñas de otros usuarios?**  
No de forma trivial. Los favoritos y reseñas tienen RLS: cada fila verifica `user_id = auth.uid()`. La anon key del frontend no bypassa RLS.

**¿La anon key en el código es un riesgo?**  
Es **diseño intencional** de Supabase. La anon key es pública; la seguridad está en **RLS** y políticas SQL, no en ocultar la clave.

**¿Dónde está la service role key?**  
Solo en `.env.local` del desarrollador para seed. **Nunca** se incluye en el bundle del cliente ni en Vercel.

**¿Las contraseñas se guardan en la base de datos del proyecto?**  
No. Supabase Auth las gestiona con hash bcrypt. ChazasUN no ve ni almacena contraseñas en texto plano.

**¿HTTPS está garantizado?**  
Sí en Vercel. En local (`localhost`) es HTTP, aceptable para desarrollo.

**¿Hay protección CSRF en Server Actions?**  
Next.js Server Actions incluyen verificación de origen en producción.

**¿Qué pasa si alguien sube malware en una imagen?**  
Storage limita MIME types a imágenes y 5 MB. No se ejecuta código del archivo en el servidor.

**¿Puedo ver el email de otro usuario?**  
No desde la API pública. Email vive en `auth.users`, no expuesto en selects de la app.

**¿El admin puede ver todo?**  
Solo métricas agregadas, reportes y acciones de moderación. No hay panel para leer emails masivamente.

**¿Hay rate limiting en reseñas?**  
Constraint UNIQUE: máximo **1 reseña por usuario por chaza**. Rate limit por IP está documentado como mejora futura.

**¿Qué datos envía analytics a terceros?**  
Eventos anónimos a Supabase (`analytics_events`). Vercel Analytics opcional para tráfico agregado. Sin email ni nombre en eventos de producto.

**¿Groq recibe fotos de cartas con datos personales?**  
Solo la imagen de carta que el chazero sube voluntariamente. No se envían datos de usuarios visitantes.

---

### Sobre privacidad

**¿Puedo usar la app sin crear cuenta?**  
Sí, para explorar, deslizar y ver detalle/mapa.

**¿Qué datos pide al registrarse?**  
Email + contraseña (o Google OAuth). Nombre para mostrar derivado del email o perfil Google.

**¿El WhatsApp del chazero es obligatorio?**  
No, pero se recomienda al menos un contacto. Si lo pone, es **público**.

**¿Cumple GDPR / Habeas Data?**  
MVP con `/privacidad` y `/terminos`. Para producción masiva conviene revisión legal colombiana (Ley 1581 de 2012).

**¿Puedo borrar mi cuenta?**  
Cascade delete en FK: borrar usuario en Supabase Auth elimina perfil, chazas, favoritos y reseñas asociadas.

---

### Sobre funcionamiento técnico

**¿Qué pasa si Supabase cae?**  
La app deja de cargar datos reales. En desarrollo sin env, hay fallback localStorage (demo).

**¿Funciona offline?**  
No es PWA aún. Requiere conexión para datos.

**¿Cómo se genera el slug de una chaza?**  
`slugify(nombre)` + reintento con sufijo si hay colisión.

**¿Cómo funciona el mapa?**  
Imagen PNG del campus en `public/maps/`. Pins con coordenadas porcentuales `{x, y}`. Enlaces a Google Maps para navegación externa.

**¿Por qué Next.js y no React puro?**  
SSR para SEO, Server Actions para seguridad, App Router para rutas organizadas, deploy sencillo en Vercel.

**¿Por qué Supabase y no backend propio?**  
PostgreSQL gestionado, Auth, Storage y RLS sin mantener servidores. Gratis para MVP.

**¿Cuántas chazas soporta?**  
PostgreSQL escala a miles sin cambio de arquitectura. El swiper carga el catálogo filtrado en memoria (optimizable con paginación si crece mucho).

**¿Hay tests automatizados?**  
Checklists manuales en `BUILD_PLAN.md`. Tests E2E pendientes.

**¿Open source?**  
Repositorio Git. Dependencias OSS (Next.js, Supabase, Tailwind, etc.).

---

### Sobre operación y despliegue

**¿Cómo accedo desde otro dispositivo en mi red?**  
`npm run dev` muestra `Network: http://192.168.x.x:3001`. Mismo Wi‑Fi requerido.

**¿Cómo pongo la app en internet?**  
Deploy en Vercel + configurar Auth en Supabase. Guía: [`VERCEL_DEPLOY.md`](VERCEL_DEPLOY.md).

**¿Cuánto cuesta operar?**  
Supabase free tier + Vercel hobby ≈ $0/mes para MVP. Dominio custom ~$12/año opcional.

**¿Cómo hago admin a alguien?**  
`UPDATE profiles SET is_admin = true WHERE id = 'uuid'` o añadir UUID a `ADMIN_USER_IDS`.

**¿Cómo verifico una chaza?**  
Panel admin → botón VERIFICAR → `verified_at = now()`.

---

### Sobre el futuro (Jetson / IA edge)

**¿Planean IA local?**  
Sí, como extensión académica: NVIDIA Jetson Orin Nano para análisis de sentimiento/emoción en reseñas, sin enviar texto a nube externa.

**¿Está implementado ya?**  
No. Documentado en [`INFORME_PROYECTO_CLASE.md`](INFORME_PROYECTO_CLASE.md).

---

## Referencias rápidas

| Documento | Contenido |
|-----------|-----------|
| [`README.md`](../README.md) | Visión, decisiones de producto, equipo |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Árbol de carpetas y rutas |
| [`SECURITY.md`](SECURITY.md) | Reglas de seguridad obligatorias |
| [`BUILD_PLAN.md`](BUILD_PLAN.md) | Fases 0–5 con checklists |
| [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md) | Configuración DB paso a paso |
| [`VERCEL_DEPLOY.md`](VERCEL_DEPLOY.md) | Deploy producción |
| [`MAPS.md`](MAPS.md) | Mapa del campus |
| [`INFORME_PROYECTO_CLASE.md`](INFORME_PROYECTO_CLASE.md) | Estado para entrega académica |

---

*Última actualización: mayo 2026 — ChazasUN v1.1*

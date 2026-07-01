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

styles/                 # CSS modular (extraido de globals.css)
  animations.css        # Keyframes y clases de animacion
  glassmorphism.css     # Utilitarios de vidrio/blur
  utilities.css         # Helpers de layout y espaciado
  globals.css           # Variables CSS globales y reset base

components/
  landing/              # Secciones marketing (solo home)
    hero-section.tsx
    campus-scroll-section.tsx   # Scroll horizontal con ScrollTrigger
    categories-section.tsx
    blog-section.tsx
    how-it-works-section.tsx
    reviews-section.tsx
    footer.tsx
  chazas/               # Swiper, cards, detalle
  layout/               # Headers, page shells
  shared/               # Coming soon, utilidades UI
  analytics/            # Provider de page views
  providers/
    lenis-provider.tsx  # Smooth scroll global (Lenis)
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
  gsap.ts               # Registro unico de plugins GSAP (ScrollTrigger, Draggable, Observer)
hooks/
  use-gsap-reduced.ts   # useGSAP con respeto a prefers-reduced-motion
  use-magnetic.ts       # Efecto magnetico en elementos interactivos
  use-scroll-reveal.ts  # Reveal progresivo en scroll
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

## Sistema visual y animaciones

### CSS modular

`app/globals.css` fue refactorizado para extraer capas independientes en `styles/`:

| Archivo | Contenido |
|---------|-----------|
| `animations.css` | Keyframes y clases de animacion (`fade-in`, `slide-up`, etc.) |
| `glassmorphism.css` | Utilitarios de vidrio — `bg-glass`, `border-glass`, `backdrop-blur-*` |
| `utilities.css` | Helpers de layout, espaciado y tipografia reutilizables |
| `globals.css` (styles/) | Reset base y variables CSS del design system (colores, radios, fuentes) |

Los cuatro se importan en `app/globals.css` (raiz) en ese orden.

### Smooth scroll — Lenis

`components/providers/lenis-provider.tsx` envuelve la aplicacion con scroll suavizado nativo via [Lenis](https://lenis.studiofreight.com/). La sincronizacion con `ScrollTrigger` es obligatoria y ya esta cableada: `lenis.on("scroll", ScrollTrigger.update)` mas manejar `lenis.raf` desde el ticker de GSAP (`gsap.ticker.add`). Sin ese puente, las animaciones con `scrub` se desincronizan del scroll real.

> Nota de testing: Lenis mantiene su propio `targetScroll`, asi que `window.scrollTo()` programatico pelea contra el y da posiciones falsas. Para medir/scrollear en pruebas usar eventos de rueda reales o `lenis.scrollTo(..., { immediate: true })`.

### Animaciones — GSAP

`lib/gsap.ts` es el **punto de entrada unico** para GSAP. Registra los plugins una sola vez en cliente:

```ts
// lib/gsap.ts
gsap.registerPlugin(ScrollTrigger, Draggable, Observer)
export { gsap, ScrollTrigger, Draggable, Observer }
```

Regla: todos los componentes importan desde `lib/gsap.ts`, nunca directamente de `gsap/ScrollTrigger`.

#### Regla anti-frágil: nunca dejar contenido crítico en un estado inicial oculto que dependa de un trigger

Un `gsap.from`/`fromTo` fija de inmediato el estado inicial (`opacity: 0`, `clipPath: inset(0 100% 0 0)`, etc.). Si el `ScrollTrigger` que lo revela no dispara —posiciones stale en el primer paint, `ScrollTrigger.batch` con timing malo, HMR, o un `pin` interrumpido— el elemento queda **invisible para siempre**. Esto ya causó dos bugs reales: el `<h2>` "CÓMO FUNCIONA" clipeado y la sección campus en blanco.

Reglas:

- No animar la opacidad del contenedor completo de una sección. Revelar solo elementos decorativos/secundarios (cards flotantes), nunca el titular ni el copy.
- Preferir `ScrollTrigger` directo con `once: true` sobre `ScrollTrigger.batch` para reveals de contenido de texto.
- En timelines con `pin`, agregar `invalidateOnRefresh: true` y llamar `ScrollTrigger.refresh()` una vez tras montar para recalcular la geometría del pin.
- Inicializar barras de progreso y estados con `gsap.set(...)` explícito, no con clases hardcodeadas a mitad de rango.

#### Gotcha: `trigger`/`pin` como string dentro de `gsap.context(scope)` se rompen en silencio

`gsap.context(callback, scopeElement)` **scopea los selectores string de ScrollTrigger** (`trigger`, `endTrigger`, `pin`) a los **descendientes** del scope. Si el elemento que querés anclar ES el scope raíz (p. ej. `sectionRef` apunta a la misma `<section>` que querés pinnear), un `trigger: ".mi-seccion"` en string **no se encuentra** → el pin no ancla nada, **no se crea `pin-spacer`** y no hay error en consola. El scrub sigue corriendo pero con el rango mal calculado (la animación "empieza a la mitad").

Regla: cuando el trigger/pin es el propio elemento con `ref`, pasar el **elemento DOM directo**, no un string:

```ts
const trigger = sectionRef.current
gsap.timeline({ scrollTrigger: { trigger, pin: trigger, /* ... */ } })
```

Diagnóstico rápido de "pin que no ancla": `document.body.scrollHeight` no crece (falta el spacer) y no existe `.pin-spacer` en el DOM. Ojo: una sección `min-h-[100dvh]` **parece** pinneada al scrollear aunque no lo esté, porque llena el viewport igual.

### Hooks de animacion

| Hook | Responsabilidad |
|------|-----------------|
| `use-gsap-reduced.ts` | Drop-in para `useGSAP` que cancela animaciones si `prefers-reduced-motion: reduce`. Devuelve un `ref` de scope. |
| `use-magnetic.ts` | Efecto magnetico (seguimiento del cursor) para CTAs e iconos interactivos. |
| `use-scroll-reveal.ts` | Reveal progresivo de elementos al entrar al viewport via `ScrollTrigger`. |

### Componentes de landing actualizados

| Componente | Cambios relevantes |
|------------|-------------------|
| `hero-section.tsx` | Entrada GSAP + parallax de la card. Sin grid de fondo ni badges flotantes (se removieron por saturacion). Titular con `leading-[0.95]` y `[text-wrap:balance]` para evitar que los descendentes choquen con el subtitulo. Dock: chazas activas + reseñas reales. |
| `campus-scroll-section.tsx` | Storytelling pinneado con `ScrollTrigger` (`pin`, `scrub`). `trigger`/`pin` reciben el **elemento DOM** (`sectionRef.current`), no un string, por el scoping de `gsap.context` (ver gotcha arriba). Pacing con holds para que los 3 momentos se lean. Salida suave scrub-bound (fade + lift del shell) al final para que soltar el pin no corte de golpe. Reveal solo en cards flotantes. |
| `categories-section.tsx` | Cards con reveal escalonado en scroll |
| `blog-section.tsx` | Fade-in con ScrollTrigger |
| `how-it-works-section.tsx` | Pasos con animacion secuencial |
| `reviews-section.tsx` | Entrada escalonada de tarjetas |
| `footer.tsx` | Reveal simple de links |

### Detalle de chaza (`chaza-detail-client.tsx`)

Reescritura mayor del componente de detalle: galeria de imagenes, botones de accion (compartir, guardar, resenar) y seccion de productos/carta rediseniados. `chaza-share-button.tsx` extraido como componente independiente con Web Share API + fallback clipboard.

## SEO y metadata

- `app/layout.tsx` define la metadata raiz: `metadataBase` (desde `NEXT_PUBLIC_SITE_URL`, fallback `localhost:3001`), `title.template` (`%s · ChazasUN`), `applicationName`, `keywords`, y objetos `openGraph` (type website, locale `es_CO`) y `twitter` (`summary_large_image`).
- **Imagen OG dinamica**: `app/opengraph-image.tsx` genera la tarjeta social con `ImageResponse` de `next/og` (1200×630, marca oscura + acento rojo). No hay imagen estatica en `public/`. Next la auto-cablea como `og:image` **y** `twitter:image` — no hace falta declararla en la metadata. Para cambiar el arte, editar ese archivo.
- Las URLs relativas de OG/canonical se resuelven contra `metadataBase`, asi que en produccion basta con setear `NEXT_PUBLIC_SITE_URL`.
- **JSON-LD**: la home (`app/(marketing)/page.tsx`) inyecta un `<script type="application/ld+json">` con un `@graph` de `Organization` + `WebSite` (server component, `dangerouslySetInnerHTML`). Sin `SearchAction` a proposito: no hay endpoint de busqueda con query param real, y no se declaran datos estructurados que no existan.
- **Sitemap y robots**: `app/sitemap.ts` lista solo rutas publicas indexables (home, explorar, mapa, blog + posts via `getAllBlogSlugs`, publicar, legales). `app/robots.ts` permite todo salvo paginas personales/admin/API (`/admin`, `/mis-chazas`, `/guardadas`, `/api/`, `/auth/`) y apunta a `/sitemap.xml`. Ambos usan `NEXT_PUBLIC_SITE_URL` con fallback localhost.

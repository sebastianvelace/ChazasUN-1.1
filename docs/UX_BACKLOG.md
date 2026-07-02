# UX & Visual Improvement Backlog — ChazasUN

Backlog de mejoras visuales, de experiencia y SEO de la landing.
**Estado persistente del loop de mejora**: se lee al empezar cada iteración y se
actualiza al terminarla. Un item = una mejora = un commit.

Leyenda: `[ ]` pendiente · `[~]` en progreso · `[x]` hecho · `[!]` bloqueado/ambiguo

---

## Prioridad alta

- [x] **Suavizar la salida del pin en `CampusScrollSection`**
  Hecho: se agregó un tramo de salida scrub-bound al final del timeline (EXIT 4.0
  → END 4.6) que eleva (`y: -48`) y atenúa (`autoAlpha: 0.5`) el `.campus-shell`
  con `ease: power2.in`, coincidiendo con el release del pin. Verificado: pin-spacer
  intacto (3964px), shell opacity 1 al top y 0.5 en salida, reversible por scrub.

- [x] **Eliminar el badge "Marketplace independiente · UN Bogotá" del hero**
  Hecho: se quitó el badge y el import huérfano de `Sparkles` en
  `hero-section.tsx`. El `space-y-6` del `.hero-copy` mantiene el ritmo; el
  titular queda como primer elemento con más aire arriba. Sin errores en consola.

- [x] **Rediseñar el titular del hero**
  Hecho: nuevo H1 "Las chazas de tu campus, a un desliz de distancia." (mantiene
  keywords chazas + campus para SEO, engancha con el mecanismo swipe y ecoa el
  "Desliza y decide" de la card). La enumeración de categorías (comida/impresión/
  reparación/compras) se movió al subtítulo para no perder ese diferencial.
  Opciones consideradas: A) "Todo el campus, a un desliz…" B) elegida C) "Desliza
  y descubre las chazas del campus" (descartada por duplicar "Descubre").

## SEO avanzado (no estructural)

- [x] **Limpiar metadata base en `app/layout.tsx`**
  Hecho: se agregó `metadataBase` (usa `NEXT_PUBLIC_SITE_URL` con fallback a
  localhost:3001, mismo patrón que `chaza-public-url.ts`), `title.template`
  (`%s · ChazasUN`) y `applicationName`. Se quitó `generator: 'v0.app'`.
  Verificado: `meta[name=generator]` ya no existe, `application-name` = ChazasUN.

- [x] **Open Graph + Twitter Card — metadata (5a)**
  Hecho: se agregaron `openGraph` (type website, locale es_CO, url, siteName,
  title, description), `twitter` (card summary_large_image) y `keywords` en
  `app/layout.tsx`. Verificado en el `<head>`: og:type/title/site_name/locale/url
  y twitter:card/title presentes. Falta la imagen (sub-item 5b).
- [x] **Open Graph + Twitter Card — imagen dinámica (5b)**
  Hecho: `app/opengraph-image.tsx` con `ImageResponse` (1200×630, marca oscura +
  glow rojo, wordmark + titular + subtítulo). Verificado: endpoint 200 image/png
  (109KB), render correcto, y Next lo auto-cableó como og:image + twitter:image
  (width 1200). Documentado en ARCHITECTURE.md (sección SEO y metadata).

- [x] **JSON-LD structured data**
  Hecho: `@graph` con `Organization` + `WebSite` inyectado en la home vía
  `<script type="application/ld+json">` (server component). SearchAction omitido
  a propósito (no hay endpoint de búsqueda real). Verificado: script en el DOM,
  JSON válido, tipos correctos, url resuelta. BreadcrumbList queda para páginas
  internas (ver item de metadata por página).

- [x] **`app/sitemap.ts` y `app/robots.ts`**
  Hecho: `sitemap.ts` con 11 URLs (7 estáticas + 4 posts vía `getAllBlogSlugs`);
  `robots.ts` permite `/` y bloquea `/admin`, `/mis-chazas`, `/guardadas`,
  `/api/`, `/auth/`, con `host` y `sitemap`. Verificado: `/sitemap.xml` 200
  application/xml (11 `<url>`), `/robots.txt` 200 con las reglas correctas.

- [x] **Auditar alt text y jerarquía de headings**
  Hecho (audit en la home): 1 solo `<h1>` ✓, jerarquía H2/H3 lógica ✓. Imágenes:
  hero card y card activa del swiper con alt descriptivo; la card "peek" del
  siguiente ya está bajo un contenedor `aria-hidden` (decorativa, correcto). Gap
  real corregido fuera del landing: el QR de `chaza-share-button.tsx` tenía
  `alt=""` → ahora "Código QR con el enlace a esta chaza". El cover de
  `mis-chaza-list-row.tsx` con `alt=""` es correcto (el nombre va como texto al
  lado; evita doble anuncio).
  Nota [!]: la sección campus renderiza 2 variantes de sus 3 H2 (animada +
  fallback `motion-reduce`), solo 3 visibles a la vez; aceptable, no se toca por
  el riesgo de romper el fallback de reduced-motion.

- [x] **Metadata por página en rutas de plataforma**
  Auditado: TODAS las páginas ya tenían `metadata`/`generateMetadata`. Se detectó
  y corrigió una regresión del `title.template`: las páginas traían el sufijo
  `| ChazasUN` y el template lo duplicaba ("Explorar chazas | ChazasUN ·
  ChazasUN"). Se quitó el sufijo en 17 archivos → "Explorar chazas · ChazasUN".
  Verificado en navegador. Commit `5ebd443` (el usuario aceptó bundlear los
  cambios preexistentes de explorar/chazas/publicar-chaza; ver incidente).

> **⚠️ Incidente (2026-07-01):** el working tree ya estaba sucio al iniciar la
> sesión (~47 archivos de "Mejoras estructurales" sin commitear). Algunos commits
> del loop (`hero-section`, `campus-scroll-section`, `how-it-works-section`,
> `(platform)/layout`, `(marketing)/page`) bundlearon esos cambios preexistentes
> bajo mensajes que no los describen. Los commits de archivos NUEVOS
> (opengraph-image, sitemap, robots) sí son atómicos. Pendiente decidir cómo
> separar el trabajo preexistente antes de seguir.

## Pulido visual / UX

- [x] **Estados `:focus-visible` accesibles en toda la app**
  Hecho: solo `blog-section` tenía focus-visible; el resto dependía del ring por
  defecto (invisible en botones redondeados). Se agregó un `:focus-visible` global
  en `app/globals.css` (`outline: 2px solid var(--ring)` = rojo de marca, offset
  2px, solo teclado). Verificado con Tab real: el CTA matchea `:focus-visible` y
  muestra el anillo. Componentes con foco propio ganan por especificidad.
- [x] **Auditar contraste AA en la landing (texto secundario)**
  Auditado midiendo ratios reales. Pasan: hero subtítulo (5.14), footer links del
  wordmark (blanco). Fallaba: `text-muted-foreground` (#6b6b6b) sobre el footer
  oscuro (3.6 < 4.5) en descripción, nav y copyright → cambiado a `text-white/70`
  (~8.5:1, pasa AA). El label decorativo "01/03" del campus (rojo de marca, 2.5)
  se deja: es un contador decorativo, no contenido de lectura, y cambiarlo
  alteraría la marca. El body del campus (`text-white/62`, ~6.8) ya pasa.
- [x] **Auditar espaciados entre secciones de la landing**
  Auditado: hero `pt-24 pb-10`, campus `py-16`, swiper `py-12 lg:py-20`,
  how-it-works `py-16 sm:py-24`, footer `pt-16 pb-12`. Ritmo aceptable; hero y
  campus son full-screen (paddings intencionalmente distintos). Única
  inconsistencia real: swiper (`py-12/lg:py-20`) vs how-it-works (`py-16/sm:py-24`).
  NO se cambió: el padding vive en `chaza-swiper.tsx`, componente **compartido**
  con `/explorar` — cambiarlo tocaría otra ruta (guardrail riesgo). Se deja como
  [!] deferido: si se quiere unificar, hacerlo vía prop de spacing en el swiper,
  no hardcodeando.

> Agregá aquí los items nuevos que descubras durante el trabajo, con una nota corta
> del por qué.

---

## Registro de cambios (bitácora)

Cada iteración deja una línea: fecha · item · commit corto.

<!-- La primera iteración empieza a registrar debajo de esta línea -->
- 2026-07-01 · Salida suave del pin en CampusScrollSection · `feat(landing): soften campus pin exit`
- 2026-07-01 · Eliminado badge "Marketplace independiente" del hero · `feat(landing): remove hero eyebrow badge`
- 2026-07-01 · Nuevo titular del hero (chazas + campus + swipe) · `feat(landing): rework hero headline`
- 2026-07-01 · metadataBase + title.template, quitado generator v0 · `feat(seo): add metadataBase and title template`
- 2026-07-01 · Open Graph + Twitter + keywords (metadata) · `feat(seo): add Open Graph and Twitter metadata`
- 2026-07-01 · Imagen OG dinámica con ImageResponse · `feat(seo): add dynamic Open Graph image`
- 2026-07-01 · JSON-LD Organization + WebSite en la home · `feat(seo): add Organization and WebSite JSON-LD`
- 2026-07-01 · sitemap.ts + robots.ts · `feat(seo): add sitemap and robots`
- 2026-07-01 · Audit alt/headings + alt descriptivo en QR · `fix(a11y): descriptive alt for share QR image`
- 2026-07-01 · Fix doble marca en títulos (title.template) · `fix(seo): strip redundant brand suffix from page titles` (5ebd443)
- 2026-07-01 · Anillo :focus-visible global (a11y teclado) · `feat(a11y): global focus-visible ring`
- 2026-07-02 · Contraste AA del texto del footer (white/70) · `fix(a11y): raise footer text contrast to AA`
- 2026-07-02 · Audit de espaciados (sin cambio: churn en componente compartido) · `docs(backlog): section spacing audit`

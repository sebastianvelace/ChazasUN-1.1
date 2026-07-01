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

- [ ] **JSON-LD structured data**
  `Organization` + `WebSite` (con SearchAction si aplica) en la landing.
  `BreadcrumbList` donde tenga sentido. Inyectar vía `<script type="application/ld+json">`.

- [ ] **`app/sitemap.ts` y `app/robots.ts`**
  Sitemap con rutas públicas conocidas; robots permitiendo indexación y apuntando
  al sitemap.

- [ ] **Auditar alt text y jerarquía de headings**
  Un solo `<h1>` por página; imágenes con alt descriptivo; orden lógico de H2/H3.

- [ ] **Metadata por página en rutas de plataforma**
  Agregar `metadata`/`generateMetadata` donde falte (explorar, mapa, blog, chazas).

## Pulido visual / UX

- [ ] **Auditar espaciados, contraste y estados hover/focus en la landing**
  Revisar consistencia de spacing, contraste AA, y que todos los interactivos
  tengan estado `:focus-visible` accesible.

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

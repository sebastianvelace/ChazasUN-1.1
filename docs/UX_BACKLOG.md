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

- [ ] **Rediseñar el titular del hero**
  El actual ("Come, imprime, repara y compra sin salir del campus") no es
  llamativo. Proponer 2-3 alternativas en este backlog, elegir una, implementarla
  con jerarquía visual más fuerte. Cuidar que siga siendo un único `<h1>` (SEO).

## SEO avanzado (no estructural)

- [ ] **Limpiar metadata base en `app/layout.tsx`**
  Agregar `metadataBase`, quitar `generator: 'v0.app'`, definir `title.template`.

- [ ] **Open Graph + Twitter Card completos**
  title, description, imagen OG (crear/asignar), locale `es_CO`, type `website`.

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

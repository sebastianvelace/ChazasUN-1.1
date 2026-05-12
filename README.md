# ChazasUN

Landing page para **ChazasUN** - El marketplace de los estudiantes de la Universidad Nacional de Colombia.

> Proyecto creado por estudiantes para estudiantes. No es un proyecto oficial de la universidad.

## Vista General

ChazasUN es una plataforma que conecta a estudiantes con las "chazas" (puestos de venta informales) dentro del campus universitario. La landing page presenta las funcionalidades principales con un diseno moderno, animaciones fluidas y una experiencia tipo Tinder para explorar chazas.

## Tecnologias

- **Framework**: Next.js 15 (App Router)
- **Estilos**: Tailwind CSS 4
- **Componentes UI**: shadcn/ui
- **Tipografia**: DM Sans + Barlow Condensed (Google Fonts)
- **Animaciones**: CSS Keyframes + Intersection Observer

## Estructura del Proyecto

```
app/
  page.tsx          # Pagina principal (landing)
  layout.tsx        # Layout con fuentes y metadata
  globals.css       # Estilos globales, tokens de color, animaciones

components/
  landing/          # Componentes de la landing page
    navbar.tsx           # Navegacion sticky con menu mobile
    hero-section.tsx     # Seccion principal con CTA y stats
    chaza-swiper.tsx     # Explorador tipo Tinder con swipe
    categories-section.tsx  # Grid de categorias de chazas
    reviews-section.tsx  # Comentarios de usuarios
    how-it-works-section.tsx  # Pasos para usar la plataforma
    blog-section.tsx     # Articulos y newsletter
    footer.tsx           # Footer con redes sociales
    wavy-background.tsx  # Fondo animado SVG
    squiggle-icon.tsx    # Icono decorativo SVG
    essence-section.tsx  # Valores de la plataforma
    index.ts             # Barrel exports

  ui/               # Componentes shadcn/ui (button, card, etc.)

hooks/
  use-scroll-reveal.ts  # Hook para animaciones al hacer scroll
```

## Paleta de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| Rojo principal | `#A31E1E` | Marca, CTAs, acentos |
| Rojo oscuro | `#7A1515` | Hover states, sombras |
| Blanco | `#FFFFFF` | Fondos, texto sobre rojo |
| Gris claro | `#F5F5F5` | Fondos secundarios |

## Componentes Principales

### ChazaSwiper
Componente interactivo tipo Tinder para explorar chazas:
- Swipe izquierda/derecha con touch o mouse
- Botones de accion (like, pass, undo, bookmark)
- Animaciones de entrada/salida de tarjetas
- Indicadores visuales LIKE/NOPE

### CategoriesSection
Grid de 12 categorias de chazas:
- Cafe y Bebidas
- Comida Rapida
- Papeleria
- Libros Usados
- Tecnologia
- Belleza
- Ropa y Accesorios
- Arte y Manualidades
- Deportes
- Musica
- Fotografia
- Transporte

### ReviewsSection
Carousel de comentarios de usuarios con:
- Avatar, nombre y facultad
- Rating con estrellas
- Chaza comentada
- Navegacion con flechas

### BlogSection
Seccion de articulos con:
- 4 posts de ejemplo
- Categorias y tiempo de lectura
- Newsletter con input de email

## Animaciones

El proyecto incluye un sistema completo de animaciones:

### Scroll Reveal
- `useScrollReveal` hook con Intersection Observer
- Clases: `.scroll-reveal-up`, `.scroll-reveal-left`, `.scroll-reveal-right`, `.scroll-reveal-scale`
- Delays escalonados: `.stagger-1` a `.stagger-6`

### Hover Effects
- `.hover-lift` - Elevacion con sombra
- `.hover-scale` - Escala sutil
- `.hover-glow` - Brillo de sombra

### Botones
- `.btn-primary`, `.btn-secondary`, `.btn-outline`
- `.btn-ripple` - Efecto ripple al click
- Animaciones: `button-pop`, `button-shake`, `button-pulse`

### Decorativas
- `.animate-float` - Flotacion suave
- `.animate-pulse-soft` - Pulso suave
- `.animate-shimmer` - Efecto brillante
- `.animate-rotate-slow` - Rotacion lenta

## Instalacion

```bash
# Clonar el repositorio
git clone https://github.com/sebastianvelace/ChazasUN-1.1.git

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## Scripts Disponibles

```bash
pnpm dev      # Servidor de desarrollo
pnpm build    # Build de produccion
pnpm start    # Servidor de produccion
pnpm lint     # Linter
```

## Desarrollo con v0

Este repositorio esta vinculado a un proyecto de [v0](https://v0.app). Puedes continuar desarrollando visitando:

[Continuar en v0](https://v0.app/chat/projects/prj_hihoz9SsfNRMSmnk6BjxdC4ye9TR)

Cada merge a `main` se despliega automaticamente.

## Proximos Pasos

- [ ] Integracion con base de datos (Supabase)
- [ ] Sistema de autenticacion
- [ ] CRUD de chazas
- [ ] Sistema de favoritos
- [ ] Chat entre usuarios
- [ ] Panel de administracion para chazeros

## Contribuidores

Proyecto desarrollado por estudiantes de la Universidad Nacional de Colombia.

---

<a href="https://v0.app/chat/api/kiro/clone/sebastianvelace/ChazasUN-1.1" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>

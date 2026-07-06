# Registro técnico de problemas y soluciones — ChazasUN

Bitácora rigurosa de los problemas encontrados durante el desarrollo, la causa
raíz de cada uno, la solución técnica aplicada y el porqué de esa decisión.

**Metodología y fuentes.** Este documento se reconstruyó a partir de: (1) el
historial completo de commits (`git log`, mayo–julio 2026); (2) la memoria
persistente de las sesiones de trabajo asistidas por Claude; (3) los gotchas ya
documentados en [`ARCHITECTURE.md`](./ARCHITECTURE.md); y (4) la auditoría de
seguridad y las pruebas E2E ejecutadas el 6 de julio de 2026. Cuando un problema
solo puede sustentarse por el mensaje de commit (fases tempranas), se indica
explícitamente para no atribuir detalle técnico no verificable.

Cada entrada sigue el mismo formato: **Síntoma → Causa raíz → Solución →
Por qué**.

---

## Índice por categoría

1. [Animaciones y scroll (GSAP / ScrollTrigger)](#1-animaciones-y-scroll-gsap--scrolltrigger)
2. [Base de datos y seguridad (Supabase / RLS)](#2-base-de-datos-y-seguridad-supabase--rls)
3. [Infraestructura y despliegue](#3-infraestructura-y-despliegue)
4. [Formularios y experiencia de usuario](#4-formularios-y-experiencia-de-usuario)
5. [SEO y metadata](#5-seo-y-metadata)
6. [Accesibilidad (a11y)](#6-accesibilidad-a11y)
7. [Proceso, Git y entorno de desarrollo](#7-proceso-git-y-entorno-de-desarrollo)
8. [Verificación funcional del registro de chazas](#8-verificación-funcional-del-registro-de-chazas)
9. [Fase temprana (referenciado por commits)](#9-fase-temprana-referenciado-por-commits)

---

## 1. Animaciones y scroll (GSAP / ScrollTrigger)

### 1.1 El pin del scroll horizontal "empezaba en la mitad" y nunca ancló

- **Síntoma.** En `CampusScrollSection` el efecto de scroll fijado (pin) arrancaba
  a mitad de camino: no se alcanzaban a ver ni el inicio ni el final de la
  animación, "como si faltara fondo negro". No había error en consola.
- **Causa raíz.** `gsap.context(callback, scope)` **acota los selectores en string
  de ScrollTrigger** (`trigger`, `endTrigger`, `pin`) a los *descendientes* del
  scope. La sección se pinneaba a sí misma pasando su propia clase como string
  (`trigger: ".campus-scroll"`), pero ese elemento **es el scope raíz**, no un
  descendiente, así que el selector no encontraba nada. Resultado: el pin no
  anclaba, **no se creaba el `pin-spacer`** (el `document.body.scrollHeight` no
  crecía) y el `scrub` corría contra un rango mal calculado. Como una sección
  `min-h-[100dvh]` llena el viewport igual, *parecía* pinneada aunque no lo
  estuviera.
- **Solución.** Pasar el **elemento DOM directo** (`sectionRef.current`) en lugar
  del string:
  ```ts
  const trigger = sectionRef.current
  gsap.timeline({ scrollTrigger: { trigger, pin: trigger, /* ... */ } })
  ```
  Verificado: `scrollHeight` pasó de ~4109 px a ~7082 px y apareció el
  `.pin-spacer` (~3964 px) en el DOM.
- **Por qué.** El scoping de `gsap.context` es intencional (evita fugas de
  selectores entre componentes), pero silencioso: no avisa cuando un selector no
  resuelve. Pasar el nodo elimina la ambigüedad. Diagnóstico rápido para este tipo
  de bug: si `scrollHeight` no crece y no existe `.pin-spacer`, el pin no está
  anclando.

### 1.2 Contenido crítico invisible por reveal frágil

- **Síntoma.** El `<h2>` "CÓMO FUNCIONA" quedaba invisible permanentemente; la
  sección campus a veces se veía en blanco.
- **Causa raíz.** Un `gsap.from`/`fromTo` fija el estado inicial de inmediato
  (`opacity: 0`, `clipPath: inset(0 100% 0 0)`). Si el `ScrollTrigger` que debía
  revelarlo no disparaba —posiciones stale en el primer paint, `ScrollTrigger.batch`
  con timing malo, HMR, o un pin interrumpido— el elemento quedaba oculto **para
  siempre**.
- **Solución.** Regla anti-frágil (documentada en `ARCHITECTURE.md`):
  - No animar la opacidad del contenedor completo de una sección; revelar solo
    elementos decorativos, nunca el titular ni el copy.
  - Preferir `ScrollTrigger` directo con `once: true` sobre `ScrollTrigger.batch`
    para revelar texto.
  - En timelines con pin: `invalidateOnRefresh: true` + un `ScrollTrigger.refresh()`
    tras montar para recalcular la geometría.
  - Inicializar barras de progreso con `gsap.set(...)` explícito.
- **Por qué.** Dejar contenido esencial detrás de un trigger que puede no ejecutarse
  convierte una animación decorativa en un punto único de falla del contenido. La
  regla mueve el riesgo a lo decorativo y garantiza que el texto siempre sea legible.

### 1.3 La salida del pin cortaba en seco

- **Síntoma.** Al soltar el pin, la sección desaparecía de golpe.
- **Solución.** Se agregó un tramo de salida atado al `scrub` al final del timeline
  que eleva (`y: -48`) y atenúa (`autoAlpha: 0.5`) el shell con `ease: power2.in`,
  coincidiendo con el release del pin. Reversible por scroll.
- **Por qué.** Una transición de salida hace que el fin del pin se sienta
  intencional en lugar de un salto abrupto. Commit: `feat(landing): soften campus pin exit`.

---

## 2. Base de datos y seguridad (Supabase / RLS)

> Los tres primeros son hallazgos de una **auditoría de seguridad agresiva**
> ejecutada el 6 de julio de 2026 a pedido explícito, sobre la propia base de
> datos y aplicación en producción.

### 2.1 CRÍTICO — Escalada de privilegios: cualquier usuario podía volverse admin

- **Síntoma.** Ninguno visible; hallazgo por inspección de las políticas RLS.
- **Causa raíz.** La política `profiles_update_own` permite a un usuario editar su
  propia fila (`using (auth.uid() = id) with check (auth.uid() = id)`), pero en
  PostgreSQL `WITH CHECK` valida **la fila, no las columnas**. No existía guard ni
  trigger sobre la columna `is_admin`. Un usuario autenticado podía ejecutar
  `update({ is_admin: true })` sobre su propia fila y **autopromoverse a
  administrador**, obteniendo acceso a `/admin/metricas`, a todos los
  `analytics_events` y a la moderación. Dato revelador: para `chazas.verified_at`
  e `is_featured` **sí** existían triggers guard (`chazas_guard_*`) — el patrón se
  conocía, pero se omitió para `profiles.is_admin`.
- **Solución.** Trigger `BEFORE UPDATE` que revierte cualquier cambio de `is_admin`
  salvo que el llamante sea admin o el cambio venga de contexto servidor
  (`auth.uid()` nulo = service_role / RPC `SECURITY DEFINER`). Migración
  `supabase/migrations/20260706120000_security_guards.sql`, commit
  `fix(security): guard is_admin escalation and rating writes...`.
  ```sql
  create trigger profiles_guard_is_admin
    before update on public.profiles
    for each row execute procedure public.profiles_guard_is_admin();
  ```
  Verificado en dos direcciones: el service_role (contexto servidor) **sí** puede
  cambiar `is_admin` (no se rompe el panel admin legítimo), y la contraseña
  filtrada de la cuenta demo dejó de ser explotable.
- **Por qué.** Se replicó el patrón guard ya existente en el proyecto (consistencia)
  en vez de endurecer la política RLS, que no soporta restricción por columna de
  forma directa. El branch `auth.uid() is null → permitido` preserva el flujo
  legítimo del backend.

### 2.2 MODERADO — El dueño podía inflar el rating de su propia chaza

- **Síntoma.** No visible; hallazgo por inspección.
- **Causa raíz.** `chazas_update_own` tampoco restringe columnas, y **ningún**
  trigger ni acción recalcula `rating`/`review_count` desde `reviews` (esas
  columnas hoy quedan siempre en 0). Un dueño podía setear su chaza a
  `rating: 5, review_count: 999` por escritura directa → prueba social falsa.
- **Solución.** Trigger `chazas_guard_rating` que congela `rating` y `review_count`
  frente a escrituras de usuarios autenticados (misma migración).
- **Por qué.** Congelar es seguro porque nada legítimo escribe esas columnas hoy.
  Si a futuro se quieren ratings reales, se agrega un trigger `SECURITY DEFINER`
  sobre `reviews` que recalcule el promedio (documentado como nota en la migración),
  sin relajar este guard.

### 2.3 CRÍTICO — Backdoor: contraseña de admin hardcodeada en el repositorio

- **Síntoma.** No visible; hallazgo al analizar la cuenta seed.
- **Causa raíz.** La cuenta demo (`demo@chazasun.local`) era **administradora** y su
  contraseña estaba **hardcodeada** en `scripts/seed-demo-chazas.ts`
  (`DEMO_PASSWORD = "DemoChazasUN_Seed_Only_22!"`). Cualquiera con acceso al
  repositorio (o a su historial, forks, o si el repo es público) podía iniciar
  sesión como esa cuenta y obtener panel admin en producción.
- **Solución (en tres pasos).**
  1. Quitar `is_admin` a la cuenta seed (neutraliza el riesgo grave de inmediato).
     No se eliminó la cuenta: es dueña de las 14 chazas demo y borrarla las
     eliminaría en cascada.
  2. Rotar la contraseña de la cuenta en producción a un valor aleatorio, para
     invalidar la que quedó filtrada en el historial de git. Verificado: la
     contraseña vieja ahora devuelve *"Invalid login credentials"*.
  3. Mover el secreto fuera del código: `scripts/seed-demo-chazas.ts` ahora lee
     `SEED_DEMO_PASSWORD` desde el entorno y falla con un mensaje claro si no está
     definido (commit `fix(security): read demo seed password from env instead of
     hardcoding it`).
- **Por qué.** Un secreto en el código termina en el historial de git para siempre;
  quitarlo del archivo actual no basta. La rotación cierra el vector de login, la
  remoción del admin cierra el vector de privilegio, y externalizar el secreto
  evita la reincidencia. Pendiente de hygiene: si el repositorio es público,
  considerar reescritura de historial (aunque el valor ya es inservible).

---

## 3. Infraestructura y despliegue

### 3.1 El proyecto de Supabase estaba pausado (auto-pausa del plan free)

- **Síntoma.** El registro no funcionaba; el subdominio del proyecto no resolvía en
  DNS (`ENOTFOUND`), pese a que internet en general y `supabase.co` sí resolvían.
- **Causa raíz.** Los proyectos de Supabase en plan **free se auto-pausan** tras
  ~1 semana de inactividad, y al pausarse el subdominio deja de resolver. No era un
  error de configuración ni de código.
- **Solución.** Restaurar el proyecto desde el dashboard de Supabase ("Restore").
  Una vez activo, la verificación de conectividad confirmó tablas, categorías y RLS
  operativos.
- **Por qué.** Es una característica del plan, no un bug. Se documenta para que en
  entregas/demos futuras se restaure el proyecto con antelación (el restore tarda
  varios minutos).

### 3.2 Falso positivo de auditoría: los security headers ya existían

- **Síntoma.** Durante la auditoría se reportó "headers de seguridad incompletos" y
  se agregaron a `next.config.mjs`.
- **Causa raíz.** El diagnóstico fue **incorrecto**: solo se miró `next.config.mjs`
  y se pasó por alto `middleware.ts`, que ya setea todos los headers vía
  `response.headers.set()` (CSP con `upgrade-insecure-requests`, `Referrer-Policy`,
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Permissions-Policy`;
  el HSTS lo agrega Vercel). El `.set()` del middleware sobreescribe en runtime, así
  que lo agregado en `next.config` nunca se aplicaba.
- **Solución.** Revertir el cambio de `next.config.mjs` y dejar `middleware.ts` como
  **única fuente** de headers (commit `refactor(config): remove redundant next.config
  headers, middleware is the single source`).
- **Por qué.** Config muerta y contradictoria (dos CSP distintos) confunde a quien
  mantenga el proyecto. Se documenta el error para dejar constancia rigurosa: **antes
  de concluir sobre headers hay que revisar el middleware**, no solo la config.

### 3.3 Despliegue: commits acumulados sin publicar

- **Síntoma.** Producción corría una versión varios commits atrás de `main` local.
- **Causa raíz.** El repositorio no tiene Vercel CLI ni `.vercel`; el despliegue se
  hace por integración de GitHub (push a `main` → build automático). El trabajo
  local se había acumulado sin push.
- **Solución.** Verificar el build de producción localmente (`next build`, limpio),
  confirmar el alcance del deploy con el usuario, y `git push origin main` para
  disparar el build de Vercel. Confirmado en vivo por los response headers y el
  `x-vercel-id` del deploy.
- **Por qué.** Pushear a la rama por defecto publica todo lo acumulado de una; se
  explicita el alcance antes de una acción irreversible hacia producción.

---

## 4. Formularios y experiencia de usuario

### 4.1 El wizard de publicación validaba en el último paso sin llevar al campo con error

- **Síntoma.** Al pulsar "Publicar" en el paso 6 (Vista previa) con un campo
  inválido en un paso anterior, aparecía el toast *"Revisa los campos resaltados"*
  pero el usuario quedaba en el paso 6 sin ver **cuál** campo estaba resaltado.
- **Causa raíz.** `form.handleSubmit` valida el esquema completo; el manejador
  `onInvalid` solo mostraba el toast. El campo inválido típico (WhatsApp) vive en el
  paso 5, no en el 6.
- **Solución.** Un mapa `FIELD_STEP` (campo → índice de paso) y un `onInvalid` que
  calcula el **primer paso con error** y hace `setStep(min)` antes del toast.
  Verificado en vivo: publicar con WhatsApp inválido saltó del paso 6 al 5.
- **Por qué.** Un error que no se puede localizar es un callejón sin salida de UX.
  Llevar al usuario al campo cierra el ciclo de retroalimentación.

### 4.2 El checklist marcaba "verde" un contacto inválido

- **Síntoma.** El checklist "Contacto accionable" se ponía verde con un WhatsApp que
  el backend rechazaba (p. ej. `+57 300 123`, con espacios).
- **Causa raíz.** El contador de canales solo verificaba "campo no vacío", mientras
  el esquema Zod exige solo dígitos (`^\d+$`, 8–15) tras un `+` opcional. Señales
  contradictorias entre el checklist y la validación real.
- **Solución.** El contador ahora valida con los propios esquemas (`whatsappSchema` /
  `instagramSchema`): cuenta solo canales presentes **y** con formato válido.
- **Por qué.** Un indicador de progreso debe reflejar la misma verdad que la
  validación de envío; si no, promete un éxito que el submit va a negar.

### 4.3 Los campos de contacto no mostraban error inline

- **Síntoma.** WhatsApp/Instagram inválidos no mostraban ningún mensaje bajo el campo
  (a diferencia de nombre, descripción, etc.).
- **Solución.** Se agregó mensaje de error inline (`text-red-600`) y `aria-invalid`
  en ambos inputs, con el mismo patrón que el resto de los campos del wizard.
- **Por qué.** Consistencia y accesibilidad: el usuario debe ver *por qué* el campo
  es inválido, y los lectores de pantalla deben anunciar el estado de error.

> Los tres fixes anteriores se verificaron end-to-end en el navegador (modo demo
> local, sin credenciales reales) y están en el commit `fix(publish-wizard): jump to
> first invalid step on submit and surface contact-field errors`.

---

## 5. SEO y metadata

### 5.1 Regresión de doble marca en los títulos

- **Síntoma.** Los títulos aparecían como "Explorar chazas | ChazasUN · ChazasUN".
- **Causa raíz.** Se agregó `title.template` (`%s · ChazasUN`) en el layout raíz,
  pero ~17 páginas ya traían el sufijo `| ChazasUN` en su título propio, así que el
  template lo duplicaba.
- **Solución.** Quitar el sufijo `| ChazasUN` de las 17 páginas para que el template
  sea la única fuente de la marca. Commit `fix(seo): strip redundant brand suffix
  from page titles`.
- **Por qué.** El `title.template` centraliza el branding; mantener el sufijo manual
  en cada página además del template es redundante y produce la duplicación.

> Contexto: la mejora de SEO (metadataBase, Open Graph, imagen OG dinámica con
> `next/og`, JSON-LD `Organization`/`WebSite`, `sitemap.ts`, `robots.ts`) se hizo sin
> alterar la estructura de rutas. Ver commits `feat(seo): ...` del 2026-07-01 y la
> sección "SEO y metadata" de `ARCHITECTURE.md`.

---

## 6. Accesibilidad (a11y)

### 6.1 Contraste insuficiente en el texto del footer

- **Síntoma.** Texto secundario del footer con contraste por debajo de WCAG AA.
- **Causa raíz.** `text-muted-foreground` (#6B6B6B) sobre el fondo oscuro del footer
  daba ~3.6:1 (< 4.5:1 requerido para texto normal).
- **Solución.** Cambiar a `text-white/70` (~8.5:1). Commit `fix(a11y): raise footer
  text contrast to AA`.
- **Por qué.** AA exige 4.5:1 para texto normal; el blanco translúcido sobre oscuro
  supera el umbral sin romper la estética de marca.

### 6.2 Anillo de foco de teclado invisible

- **Síntoma.** Al navegar con Tab, los botones redondeados no mostraban un foco claro.
- **Solución.** Regla global `:focus-visible { outline: 2px solid var(--ring); }` en
  `globals.css` (solo teclado, no aparece al click). Commit `feat(a11y): global
  focus-visible ring`.
- **Por qué.** `:focus-visible` distingue foco de teclado del de mouse; el `--ring`
  (rojo de marca) da un indicador consistente y visible sin ensuciar el click.

### 6.3 Imagen de QR sin texto alternativo descriptivo

- **Síntoma.** El QR de compartir tenía `alt=""`.
- **Solución.** `alt="Código QR con el enlace a esta chaza"`. Commit `fix(a11y):
  descriptive alt for share QR image`.
- **Por qué.** El QR transmite información (el enlace); no es decorativo, así que
  necesita alt descriptivo para lectores de pantalla.

---

## 7. Proceso, Git y entorno de desarrollo

### 7.1 Working tree sucio: commits que mezclaron trabajo preexistente

- **Síntoma.** Al iniciar una sesión, el árbol de trabajo ya tenía ~47 archivos con
  cambios sin commitear ("mejoras estructurales"). Los commits atómicos del loop de
  mejoras terminaron **arrastrando** parte de ese trabajo preexistente bajo mensajes
  que no lo describían del todo.
- **Solución.** Se detuvo el trabajo al detectarlo, se explicó el incidente y se
  agrupó el trabajo preexistente en un commit propio (`feat: mejoras estructurales`)
  separando lo posible; los archivos nuevos (imagen OG, sitemap, robots) sí quedaron
  atómicos. Documentado en `docs/UX_BACKLOG.md` (nota de incidente).
- **Por qué.** Empezar con un árbol limpio evita mezclar cambios no relacionados; se
  documenta como lección de proceso.

### 7.2 Imports rotos latentes (componentes sin trackear)

- **Síntoma.** Dos componentes (`catalog-load-state.tsx`, `chaza-detail-state.tsx`)
  eran importados por páginas ya commiteadas, pero los archivos estaban **sin
  trackear** en git: un checkout limpio habría fallado al compilar.
- **Solución.** Commitear los componentes faltantes. Verificado con `tsc --noEmit`
  (exit 0) y `next build`.
- **Por qué.** Un repositorio debe compilar desde un clon limpio; los archivos
  referenciados por código versionado también deben estar versionados.

### 7.3 Colisión de servidores de desarrollo en el puerto 3001

- **Síntoma.** Un `next dev` nuevo fallaba con `EADDRINUSE`; a la vez el puerto
  respondía, sirviendo código **viejo**.
- **Causa raíz.** Instancias previas de `next dev` quedaron vivas (un `kill` con
  `head -1` solo mató una de varias).
- **Solución.** `pkill -f "next dev"` + verificación de que el puerto 3001 quedara
  libre antes de relanzar. Para probar UX sin auth real, se corrió el servidor en
  **modo demo** (`NEXT_PUBLIC_SUPABASE_URL= NEXT_PUBLIC_SUPABASE_ANON_KEY= npm run
  dev`) que activa la sesión mock local (login sin validar contraseña).
- **Por qué.** Verificar contra el proceso equivocado invalida la prueba; asegurar
  un puerto limpio garantiza que se prueba el código actual.

---

## 8. Verificación funcional del registro de chazas

No es un problema en sí, pero es parte del requisito de calidad de la entrega y se
documenta el método de verificación.

- **Objetivo.** Asegurar que el registro de chazas es funcional de punta a punta.
- **Método.** Doble verificación: (1) contrato de backend — se simuló el payload
  exacto de `publishChazaAction` contra Supabase (insert en `chazas`,
  `chaza_categories`, `chaza_products`), se leyó de vuelta con sus joins y se limpió;
  (2) E2E por la interfaz real en producción — se completó el wizard de 6 pasos hasta
  publicar y se confirmó la fila resultante en la base de datos, con limpieza
  posterior.
- **Resultado.** Registro **funcional**. La cadena `signup` → trigger
  `on_auth_user_created` → fila en `profiles` → `owner_id` de la chaza es coherente,
  así que no hay violación de llave foránea para usuarios nuevos.
- **Hallazgo colateral.** El bug de UX 4.1/4.2/4.3 se descubrió precisamente durante
  este E2E (un WhatsApp con espacios hizo fallar el submit de forma poco clara).

---

## 9. Fase temprana (referenciado por commits)

Trabajo de mayo–junio 2026 cuya evidencia disponible es el historial de commits. Se
lista para completitud, sin atribuir detalle técnico que no pueda sustentarse.

| Fecha | Commit | Área |
|-------|--------|------|
| 2026-06-23 | `Harden security and clean dependency audit` | Seguridad / dependencias |
| 2026-06-23 | `Improve chaza detail and publishing QA` | Registro / detalle |
| 2026-06-23 | `Improve discovery UX and GSAP motion` | UX / animación |
| 2026-06-16 | `Implementacion gsap, mejoras visuales` | Animación |
| 2026-06-10 | `uso de gsap` / `uso de gsap mejorado` | Animación |
| 2026-06-09 | `Explorar: grilla completa, categorías visibles...` | Explorador |
| 2026-06-01 | `cambios en auth, registro, categorias, hero` | Autenticación |
| 2026-05-25 | `Revision de seguridad y mejora de front` | Seguridad |

La auditoría del 6 de julio de 2026 confirmó que, tras estas fases, el manejo del
`service_role` (solo server-side), la autorización de administrador
(`requireAdminSession`, con default seguro), las políticas de Storage
(restringidas a la carpeta del propio usuario) y las dependencias de producción
(`pnpm audit --prod` sin vulnerabilidades) quedaron **correctos**; los tres
hallazgos críticos/moderados de la sección 2 son los que faltaban por cerrar y ya
están resueltos.

---

## Resumen del estado tras resolver

- Registro de chazas: **funcional** (verificado backend + E2E).
- Vulnerabilidades reales (escalada `is_admin`, rating inflable, backdoor seed):
  **cerradas**.
- Un único administrador legítimo; contraseña filtrada **invalidada**.
- Fixes de UX del wizard: **verificados y desplegados**.
- Headers de seguridad: correctos (fuente única: `middleware.ts`).
- Árbol de trabajo limpio y `main` en sincronía con el remoto; producción al día.

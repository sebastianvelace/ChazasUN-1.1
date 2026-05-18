# Configuracion manual — Supabase (ChazasUN)

Sigue estos pasos **una vez** cuando tengas cuenta en [supabase.com](https://supabase.com). No pegues claves secretas en chats ni en commits.

## 1. Crear proyecto

1. Entra al dashboard y **New project**.
2. Elige **region** cercana (p. ej. `South America`).
3. Anota la **contraseña** de la base de datos (por si usas conexion directa).

## 2. Variables en Next.js

En la raiz del repo crea `.env.local` (no se sube a git):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://TU-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...anon...

# Solo local: seed y scripts admin (nunca en el cliente ni en Vercel)
SUPABASE_SERVICE_ROLE_KEY=eyJ...service_role...
```

- **Project URL** y **anon public** key: **Settings → API** (o el dialog **Connect**).
- **service_role**: la misma pantalla; usala solo en tu maquina para `pnpm db:seed`.

Reinicia `pnpm dev` tras guardar.

## 3. Aplicar el esquema SQL

Opcion A — **SQL Editor** en Supabase:

1. Abre `supabase/migrations/20260218120000_init_schema.sql` en tu editor.
2. Copia todo el contenido y pegalo en **SQL Editor → New query**.
3. Ejecuta (**Run**).

Opcion B — **Supabase CLI** (si ya la usas): `supabase db push` o `supabase migration up` segun tu flujo.

Si el trigger falla por sintaxis (`execute procedure` vs `execute function`), en PostgreSQL reciente prueba sustituir la linea del trigger por:

```sql
for each row execute function public.handle_new_user();
```

## 4. Migraciones posteriores al esquema inicial

### Fase 2 — Storage + admin

Ejecuta `supabase/migrations/20260220120000_storage_admin_analytics.sql` en el SQL Editor (bucket `chaza-covers`, columna `profiles.is_admin`, politicas de lectura de analytics para admins).

Para acceso al panel `/admin/metricas`: `update profiles set is_admin = true where id = 'TU-UUID';` o define `ADMIN_USER_IDS` en `.env.local`.

### Fase 3 — Reportes y moderacion

Ejecuta `supabase/migrations/20260221120000_reports_moderation.sql` despues de las anteriores. Crea `content_reports`, RLS para reporter y admins, y permite a admins actualizar `chazas.status` / `reviews.status` para moderacion.

### Fase 4 — Vision de carta (limite por usuario)

Ejecuta `supabase/migrations/20260222120000_menu_vision_usage.sql` si usas la funcion **Analizar foto de carta** (Groq). Crea `menu_vision_usage` con RLS: cada usuario solo inserta y lee sus propias filas para contar hasta **5 analisis por hora** sin depender de `analytics_events` (solo admins leen esa tabla).

### OAuth (Google) — nombre en `profiles`

Ejecuta `supabase/migrations/20260518120000_profiles_oauth_display_name.sql` para que el trigger `handle_new_user` rellene `display_name` tambien desde `full_name` / `name` cuando alguien entra con **Google** (ademas de email + `display_name` manual).

### Fase 5.2 — Sello verificada en chazas

Ejecuta `supabase/migrations/20260519120000_chazas_verified_at.sql`. Anade `chazas.verified_at`, la funcion RPC `admin_set_chaza_verified` (solo filas con `profiles.is_admin = true`) y un trigger que impide a dueños no admin cambiar ese campo. Si tu admin entra solo por `ADMIN_USER_IDS` en `.env` sin `is_admin` en DB, el servidor usa `SUPABASE_SERVICE_ROLE_KEY` para esa operacion.

### Fase 5.3 — Destacados fuera del swiper

Ejecuta `supabase/migrations/20260520120000_chazas_featured.sql`. Anade `chazas.featured_until` y `chazas.featured_rank`, la RPC `admin_set_chaza_featured(p_slug, p_until, p_rank)` y el trigger `chazas_guard_featured` (solo admins mutan esos campos). La franja en `/explorar` lista chazas publicadas con `featured_until > now()` ordenadas por `featured_rank`; **no** cambia el orden del mazo del swiper.

## Variables opcionales — Vision de carta (Groq)

Solo **servidor**; anade en `.env.local` (y en Vercel si aplica) cuando quieras la UX de foto → sugerencias:

| Variable | Uso |
|----------|-----|
| `ENABLE_MENU_VISION` | `true` para mostrar el boton de analisis en wizard y editar chaza |
| `GROQ_API_KEY` | Clave de API Groq (OpenAI-compatible) |
| `GROQ_VISION_MODEL` | Opcional; si no se define, la app usa el modelo por defecto en codigo |

Ver nota de privacidad en [`docs/SECURITY.md`](SECURITY.md).

## 5. Datos demo (14 chazas)

Con el esquema aplicado y `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`, ejecuta **una vez** en la raiz del repo:

```bash
pnpm db:seed
```

Crea el usuario Auth `demo@chazasun.local` (si no existe) e inserta las chazas de `lib/constants/mock-chazas.ts` de forma idempotente (si el `slug` ya existe, se omite).

## 6. Auth — URLs de redireccion

**Authentication → URL configuration**:

| Campo | Valor (desarrollo) |
|--------|---------------------|
| Site URL | `http://localhost:3001` |
| Redirect URLs | `http://localhost:3001/auth/callback` |

Para produccion (Vercel), añade tambien:

`https://TU-DOMINIO.vercel.app/auth/callback`

La app de desarrollo usa el puerto **3001** (`pnpm dev`).

## 7. Email / confirmacion

**Authentication → Providers → Email**:

- Activa **Email**.
- En desarrollo puedes **desactivar “Confirm email”** para probar mas rapido (en produccion conviene dejarlo activo).

Si la confirmacion esta activa, tras registrarte debes abrir el enlace del correo; ese enlace vuelve a `/auth/callback` y crea la sesion.

### Error: "Email logins are disabled" (422 en login)

Significa que el proveedor **Email** sigue **apagado** o "Enable email signups" esta desactivado segun la version del dashboard.

1. Ve a **Authentication → Providers** (o **Sign In / Providers**).
2. Abre **Email**.
3. Activa **Enable Email provider** (y deja permitido el registro con email si usas `/registro`).
4. Guarda; espera unos segundos y prueba de nuevo en `/login`.

En proyectos nuevos de Supabase a veces solo esta activo magic link u otro proveedor por defecto hasta que habilitas Email explicitamente.

### Contrasena: no se puede “ver” en Supabase

Las contrasenas se guardan como **hash** (unidireccional). Nadie (ni tu en el dashboard) puede leer la contrasena original. Si no la recuerdas: en la app usa **`/recuperar-contrasena`**; llegara un enlace que abre sesion y te lleva a **`/restablecer-contrasena`** para elegir una nueva.

## 7bis. Inicio con Google (OAuth)

1. [Google Cloud Console](https://console.cloud.google.com/) → Crea o elige un proyecto → **APIs y servicios** → **Credenciales** → **Crear credenciales** → **ID de cliente de OAuth** → tipo **Aplicacion web**.
2. **Origenes JavaScript autorizados:** `http://localhost:3001` (y en produccion tu dominio, ej. `https://tu-app.vercel.app`).
3. **URI de redireccion autorizados:** solo el callback de Supabase (no pongas aqui la URL de tu app Next):
   - `https://TU-REF.supabase.co/auth/v1/callback`  
   - El `TU-REF` sale de tu **Project URL** (`https://TU-REF.supabase.co`).
4. Copia **ID de cliente** y **Secreto del cliente**.
5. En Supabase: **Authentication → Sign In / Providers → Google** → activar y pegar **Client ID** y **Client Secret** → Guardar.

La app ya usa **Continuar con Google** en `/login` y `/registro` (mismo flujo que el email: redireccion a `/auth/callback`).

Si Google responde error de **redirect_uri_mismatch**, revisa que la URI en Google Cloud sea **exactamente** `https://TU-REF.supabase.co/auth/v1/callback` (con `https`, sin barra final si Google la rechaza).

## 8. Probar

1. `pnpm dev` (puerto 3001)
2. `pnpm db:seed` si aun no importaste las chazas demo
3. Ve a `/registro`, crea cuenta (o usa la cuenta demo si la necesitas para datos seed).
4. Ve a `/login` e inicia sesion.
5. Ve a `/explorar`: deberias ver las chazas publicadas en la base de datos.

## 9. Deploy en Vercel (cuando quieras URL publica)

**Guia completa paso a paso:** [`docs/VERCEL_DEPLOY.md`](VERCEL_DEPLOY.md) (orden local vs produccion, variables, Auth, Google, smoke test, problemas frecuentes).

Resumen:

1. Proyecto en Vercel conectado al repo; **Environment Variables:** `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (no subir `SUPABASE_SERVICE_ROLE_KEY` al cliente ni a variables publicas expuestas).
2. Supabase Auth → **URL configuration**: **Site URL** = tu dominio Vercel (ej. `https://tu-proyecto.vercel.app`) y en **Redirect URLs** incluye `https://tu-proyecto.vercel.app/auth/callback` ademas de `http://localhost:3001/auth/callback`.
3. `pnpm build` en local sin errores antes de confiar en el deploy.
4. Smoke en produccion: login, explorar, like/guardar, publicar con foto (Storage), `/admin/metricas` con cuenta `is_admin`, pestaña Reportes si aplicaste la migracion Fase 3.

## Catalogo y datos

Con variables Supabase configuradas, el explorador y el mapa leen chazas **publicadas** desde Postgres (`status = published`). Sin `NEXT_PUBLIC_SUPABASE_*`, la app sigue usando mocks y `localStorage` como antes.

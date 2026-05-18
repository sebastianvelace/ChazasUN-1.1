# Despliegue en Vercel — Guia paso a paso (ChazasUN)

Esta guia une **Supabase**, **Vercel**, **Auth (correo y Google)** y **variables opcionales** (vision de carta con Groq). Esta pensada para alguien que lo hace por primera vez.

Documentacion relacionada: [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md), [`SECURITY.md`](SECURITY.md), [`ARCHITECTURE.md`](ARCHITECTURE.md).

---

## ¿Es mejor desplegar en Vercel primero?

**Depende del objetivo:**

| Orden | Cuando tiene sentido |
|-------|----------------------|
| **Local primero** (`pnpm dev` en puerto 3001) | Aprender el proyecto, tocar codigo, usar seed y migraciones sin exponer nada. Auth con `localhost` funciona bien. |
| **Vercel pronto** (URL publica tipo `*.vercel.app`) | Quieres probar en el movil de otra persona, compartir enlace, usar **Google OAuth** con una URL “real”, o hacer demo sin depender de tu PC. |

**Recomendacion practica:** tener **Supabase ya creado** y **migraciones aplicadas** antes o en paralelo al deploy. Puedes desarrollar en local y, cuando el build pase (`pnpm build`), subir a Vercel. No es obligatorio “solo Vercel sin local”: lo habitual es **los dos**.

**Importante:** despues del primer deploy **debes** actualizar en Supabase la **Site URL** y las **Redirect URLs** con la URL de Vercel. Si no, el login y el correo de recuperacion apuntaran solo a `localhost` y fallaran en produccion.

---

## Que vas a conseguir al final

1. Una URL publica (ej. `https://chazasun.vercel.app`).
2. La app conectada al **mismo proyecto Supabase** que uses en local (una sola base de datos compartida) *o* un proyecto Supabase distinto para staging (avanzado).
3. Inicio de sesion con **correo/contrasena** y/o **Google**, si los configuras.
4. Sin subir al repo claves secretas (`service_role`, `GROQ_API_KEY`, etc.).

---

## Parte 0 — Requisitos previos

1. **Cuenta en [GitHub](https://github.com)** (u otro Git compatible con Vercel) con el codigo de ChazasUN subido.
2. **Cuenta en [Vercel](https://vercel.com)** (puedes entrar con GitHub).
3. **Proyecto en [Supabase](https://supabase.com)** ya creado.
4. En tu maquina: **Node.js** y **pnpm** si quieres validar el build antes (`pnpm install`, `pnpm build`).

---

## Parte 1 — Base de datos y Auth en Supabase (antes o justo despues del deploy)

Haz esto **una vez** por proyecto Supabase.

### 1.1 Aplicar migraciones SQL en orden

En Supabase: **SQL Editor** → New query. Para cada archivo de `supabase/migrations/` en el repo, **en orden de nombre de archivo**:

1. `20260218120000_init_schema.sql`
2. `20260220120000_storage_admin_analytics.sql`
3. `20260221120000_reports_moderation.sql`
4. `20260222120000_menu_vision_usage.sql` — solo si usaras “Analizar foto de carta” (Groq).
5. `20260518120000_profiles_oauth_display_name.sql` — recomendado si usas **Google** (nombre en perfil).

Copia el contenido de cada archivo, pegalo, **Run**. Si un archivo ya se ejecuto antes, puede dar errores de “already exists”; en ese caso revisa el mensaje o ejecuta solo los que falten.

Detalle de cada migracion: [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md) §4.

### 1.2 Activar proveedor Email (correo + contrasena)

**Authentication → Providers → Email**

- Activa el proveedor **Email**.
- En desarrollo a veces se desactiva **Confirm email** para ir mas rapido; en produccion suele convenir dejarla activa.

Si Email esta apagado, veras errores como **Email logins are disabled** al entrar.

### 1.3 (Opcional pero muy recomendable) Google OAuth

Resumen; detalle en [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md) §7bis.

1. **Google Cloud Console** → tu proyecto → **Credenciales** → **ID de cliente OAuth** (aplicacion web).
2. **Origenes JavaScript autorizados** — añade **ambos** cuando ya tengas la URL de Vercel:
   - `http://localhost:3001`
   - `https://TU-PROYECTO.vercel.app` (sustituye por tu dominio real)
3. **URI de redireccion autorizados** — **solo** el callback de Supabase (no la URL de tu app Next):
   - `https://TU-REF.supabase.co/auth/v1/callback`
   - `TU-REF` es la parte de tu **Project URL** (ej. si la URL es `https://abcdefgh.supabase.co`, el ref es `abcdefgh`).
4. Copia **Client ID** y **Client Secret** → **Supabase → Authentication → Providers → Google** → activar y pegar → Guardar.

Si Google muestra **redirect_uri_mismatch**, la URI en Google Cloud **no coincide** con la que Supabase usa. Debe ser exactamente `https://TU-REF.supabase.co/auth/v1/callback`.

### 1.4 Admin del panel `/admin/metricas`

- Opcion A: en la tabla `profiles`, marca `is_admin = true` para tu usuario.
- Opcion B: variable `ADMIN_USER_IDS` en Vercel con tu UUID de usuario (ver codigo / docs).

---

## Parte 2 — Primer deploy en Vercel

### 2.1 Importar el repositorio

1. Entra a [vercel.com](https://vercel.com) → **Add New…** → **Project**.
2. **Import** el repositorio de ChazasUN (conecta GitHub si hace falta).
3. Vercel suele detectar **Next.js** y **pnpm** solo (hay `pnpm-lock.yaml` en el repo).

### 2.2 Ajustes de build (por defecto suelen valer)

- **Framework Preset:** Next.js  
- **Build Command:** `pnpm build` (o el default que proponga Vercel)  
- **Output:** lo gestiona Next  
- **Install Command:** `pnpm install` (si no, Vercel lo infiere)

No hace falta configurar el puerto 3001: eso es solo en **local** (`pnpm dev -p 3001`). En Vercel el servidor de produccion lo define la plataforma.

### 2.3 Variables de entorno (obligatorias)

En el asistente de importacion, seccion **Environment Variables**, añade al menos:

| Nombre | Valor | Ambiente |
|--------|--------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Tu Project URL (`https://xxx.supabase.co`) | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon public key | Production, Preview, Development |

**No** añadas `SUPABASE_SERVICE_ROLE_KEY` en Vercel salvo un caso muy avanzado (y nunca como variable que empiece por `NEXT_PUBLIC_`). La **service role** bypass RLS y no debe llegar al navegador.

Opcionales (solo servidor; sin prefijo `NEXT_PUBLIC_`):

| Nombre | Uso |
|--------|-----|
| `ADMIN_USER_IDS` | UUIDs separados por coma con acceso admin si no usas `is_admin` en DB |
| `ENABLE_MENU_VISION` | `true` para mostrar analisis de carta por IA |
| `GROQ_API_KEY` | Clave Groq (vision de carta) |
| `GROQ_VISION_MODEL` | Modelo opcional |

Guarda y pulsa **Deploy**.

### 2.4 Esperar el build

- Si falla, abre el log: suele ser TypeScript, dependencias o variables faltantes.
- En local puedes reproducir con: `pnpm install && pnpm build`.

### 2.5 Anota tu URL de produccion

Ejemplo: `https://chazas-un-xxx.vercel.app`. La veras en el dashboard del proyecto → **Domains**.

---

## Parte 3 — Alinear Supabase Auth con la URL de Vercel

Sin este paso, **login, registro, Google y correo de recuperacion** pueden fallar en produccion.

1. Supabase → **Authentication** → **URL configuration**.
2. **Site URL:** pon la URL **principal** de tu app en produccion, por ejemplo:  
   `https://chazas-un-xxx.vercel.app`
3. **Redirect URLs:** debe incluir **al menos** estas lineas (una por linea; adapta dominio y puerto local):

```
http://localhost:3001/auth/callback
https://chazas-un-xxx.vercel.app/auth/callback
```

Si usas **Preview Deployments** de Vercel (cada PR con su URL distinta), o añades todas las URLs que uses o, en entornos grandes, un dominio staging fijo. Para empezar, **Production** suele bastar con una URL estable.

4. Guarda los cambios en Supabase.

La app redirige a `/auth/callback` para OAuth, Google, enlaces de correo y recuperacion de contrasena (segun flujo). Esa ruta debe estar **permitida** aqui.

---

## Parte 4 — Volver a Google Cloud (origenes con la URL de Vercel)

Cuando ya conozcas la URL definitiva de produccion:

1. Google Cloud Console → tu **ID de cliente OAuth** (web).
2. **Origenes JavaScript autorizados:** incluye  
   `https://tu-proyecto.vercel.app`  
   ademas de `http://localhost:3001`.
3. Guarda.

La **URI de redireccion** en Google **sigue siendo solo** `https://TU-REF.supabase.co/auth/v1/callback` (no añadas la URL de Vercel ahi).

---

## Parte 5 — Smoke test (comprobar que todo funciona)

En tu URL de Vercel, en este orden:

1. **Home y rutas publicas** (`/`, `/explorar`, `/blog`) cargan.
2. **Registro** `/registro` con correo (y confirmacion de email si esta activa).
3. **Login** `/login` con correo.
4. **Google** “Continuar con Google” si lo configuraste.
5. **Recuperar contrasena** `/recuperar-contrasena` → correo → **`/restablecer-contrasena`** (las contrasenas **no** se ven en Supabase; solo restablecer).
6. **Explorar / detalle / mapa** con datos reales de Supabase.
7. **Publicar** o editar chaza (subida a Storage si aplica).
8. **Admin** `/admin/metricas` con usuario admin.

---

## Parte 6 — Deploys siguientes

Cada **push** a la rama conectada (normalmente `main`) suele disparar un **nuevo deploy** en Vercel.

- Si cambias **variables de entorno**, en Vercel a veces hace falta **Redeploy** para que el build las tome.
- **Preview** por PR: URLs temporales; si necesitas Auth en previews, añade cada patron de URL en **Redirect URLs** de Supabase o usa una politica de equipo mas simple (solo produccion al principio).

---

## Problemas frecuentes

| Sintoma | Causa probable | Que hacer |
|---------|----------------|-----------|
| Login OK en local, falla en Vercel | Site URL / Redirect URLs solo con localhost | Parte 3 de esta guia |
| **Email logins are disabled** | Email apagado en Supabase | Activar proveedor Email |
| **redirect_uri_mismatch** (Google) | URI incorrecta en Google Cloud | Solo `https://TU-REF.supabase.co/auth/v1/callback` |
| **Invalid login credentials** | Mal contrasena o email no confirmado | Prueba recuperar contrasena; revisa bandeja de confirmacion |
| Datos vacios en produccion | Otra base / sin datos | Mismo `NEXT_PUBLIC_SUPABASE_URL` que en local; ejecuta seed solo en local con service role |
| Vision carta no aparece | Falta env en Vercel | `ENABLE_MENU_VISION`, `GROQ_API_KEY`; migracion `menu_vision_usage` |

---

## Resumen ultra corto (checklist)

- [ ] Migraciones SQL aplicadas en Supabase (en orden).
- [ ] Email activo en Supabase; Google opcional configurado.
- [ ] Proyecto en Vercel con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] Supabase **Site URL** = URL de Vercel.
- [ ] Supabase **Redirect URLs** incluyen `https://tu-app.vercel.app/auth/callback` y `http://localhost:3001/auth/callback`.
- [ ] Google Cloud: origen JS incluye URL de Vercel; redirect URI sigue siendo Supabase.
- [ ] Smoke test login + una ruta autenticada.

Para desarrollo local detallado (puerto 3001, seed, etc.), sigue [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md).

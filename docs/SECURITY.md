# Seguridad y privacidad — ChazasUN

## Datos que NO recogemos en MVP exploracion

- Nombre real obligatorio para navegar
- Documento / carnet universitario
- Email para solo ver el swiper

## Datos que SI recogemos

| Dato | Proposito | Almacenamiento |
|------|-----------|----------------|
| Sesion analytics anonima (UUID) | Metricas de uso, tiempo en tarjetas | sessionStorage + futuro `analytics_events` |
| Vercel Analytics | Trafico agregado | Vercel |
| Cuenta (email) | Auth, comentarios, editar chaza | Supabase Auth (fase 2) |
| Contenido de chaza | Marketplace | Supabase DB + Storage |

## Reglas de implementacion (obligatorias)

1. **RLS** en todas las tablas con datos de usuarios.
2. **Validar en servidor** con Zod (nunca confiar solo en el cliente).
3. **Service role key** solo en Server Actions / cron — nunca en bundle cliente.
4. **Comentarios**: cuenta obligatoria + `checkProfanity()` en cliente y servidor.
5. **Rate limiting** en API de resenas (Supabase Edge o middleware).
6. **HTTPS** via Vercel; cookies de sesion `httpOnly` con `@supabase/ssr`.
7. **Contacto del chazero** (WhatsApp): opt-in con aviso de visibilidad publica.

## Endurecimiento aplicado (mayo 2026)

| Riesgo | Mitigacion |
|--------|------------|
| Open redirect en `/auth/callback` | `safeNextPath()` en `lib/security/safe-redirect.ts` — solo rutas relativas `/...`; rechaza `//`, esquemas, `@`, `\` y trucos encoded |
| Upload de portada no-imagen | Allowlist MIME + magic bytes en `lib/security/image-magic-bytes.ts` y `lib/actions/upload-cover.ts` (alineado al bucket `chaza-covers`) |
| Contacto malformado (WhatsApp / Instagram) | Schemas Zod en `lib/validations/chaza.ts` (publicar y editar) |
| `cover_image_url` arbitraria en DB | CHECK constraint en migracion `20260521120000_chaza_cover_url_check.sql` (null, vacio o `https://`) |
| XSS / recursos externos | CSP en produccion via `next.config.mjs` (Supabase, OAuth Google, Vercel Analytics) |

## Filtro de palabras ofensivas

- Implementacion inicial: `lib/security/profanity.ts`
- Duplicar validacion en Server Action al crear resena.
- Ampliar lista con moderacion admin.

## Reportes

Tabla `review_reports` / `chaza_reports` + panel admin (fundador).

## Vision de carta (Groq, opcional)

- Si activas `ENABLE_MENU_VISION=true` y `GROQ_API_KEY`, el **servidor** envia la **foto de la carta** al proveedor [Groq](https://groq.com/) para sugerir productos (texto). La imagen **no** se guarda en ChazasUN ni se registra en analytics; solo se cuenta uso por usuario en la tabla `menu_vision_usage` para el limite horario.
- **Retencion y tratamiento** de la imagen en tránsito/cheo del proveedor dependen de la politica de Groq; no asumas que la imagen queda privada en el sentido legal sin revisar sus terminos. El usuario **confirma** en la UI antes de que los productos sugeridos se guarden en `chaza_products`.

## Cumplimiento minimo

- `/terminos` y `/privacidad` antes de lanzamiento publico.
- Checkbox al registrarse.

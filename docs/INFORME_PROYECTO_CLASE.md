# ChazasUN — Estado del proyecto para informe de clase

Documento de referencia para elaborar el informe final según la rúbrica del curso.  
Basado en [`README.md`](../README.md), [`BUILD_PLAN.md`](BUILD_PLAN.md) y el estado del repositorio (mayo 2026).

**Leyenda:** ✅ Hecho · 🟡 Parcial / borrador · ❌ Pendiente

---

## Resumen ejecutivo

| Área | Avance estimado | Comentario |
|------|-----------------|------------|
| **Software web (MVP)** | ~95 % | Plataforma funcional en local con Supabase |
| **Documentación de informe** | ~25 % | Este documento + README; falta redacción IEEE completa |
| **Evidencias (fotos, videos)** | ~10 % | Pendiente grabar y organizar |
| **Deploy producción** | ❌ | Fase 5.4 sin cerrar |

**Etapa actual:** fin de desarrollo de software (Fases 0–5.3) + documentación académica.

---

## 1. Abstract

**Estado:** 🟡 Borrador (redactar en inglés, máx. 5 líneas)

**Borrador sugerido:**

> ChazasUN is a free web platform that helps university campus visitors discover informal food and service stalls (“chazas”) through a Tinder-like swiper, interactive map, and user reviews. The proposed system combines a Next.js frontend and Supabase backend with server-side profanity filtering and admin-only moderation tools. The current prototype runs on a local development server with authenticated publishing, favorites, analytics, and admin tools; production deployment remains in progress.

**Pendiente:** actualizar con URL de deploy.

---

## 2. Introducción

| Subsección | Estado | Contenido disponible |
|------------|--------|----------------------|
| Contexto del problema | ✅ | README § Visión — boca a boca, falta de catálogo centralizado en campus UN Bogotá |
| Necesidad identificada | ✅ | Descubrimiento de chazas, contacto, reseñas, visibilidad para emprendedores |
| Solución propuesta | ✅ | Marketplace web gratuito + swiper + mapa + moderación (profanidad + admin) |

**Pendiente para el informe:**

- [ ] Redactar en prosa académica (no solo bullets).
- [ ] Objetivos específicos medibles (ej.: “publicar reseña con filtro profanidad en < 200 ms”).

---

## 3. Diseño del sistema

### 3.1 Requerimientos

| Requerimiento | Estado | Detalle |
|---------------|--------|---------|
| Plataforma web responsive | ✅ | Next.js 16, mobile-first |
| Bajo costo operativo | ✅ | Stack gratuito (Supabase free tier, Vercel hobby) |
| Open-source / código propio | ✅ | Repositorio Git; dependencias OSS |
| Sin PII en analytics de navegación | ✅ | Sesión anónima + `analytics_events` |
| Moderación de comentarios | ✅ | Filtro léxico (`lib/security/profanity.ts`) + cola admin |
| Servidor en LAN (bonus) | 🟡 | App accesible en red local (`192.168.x.x:3001`); falta video evidencia |

**Restricciones a documentar en el informe:**

- Solo español (v1).
- Sin chat in-app ni pagos.
- Proyecto independiente, no oficial UN.

### 3.2 Entorno de despliegue

**Estado general:** ✅ — El producto es **exclusivamente software**.

#### Arquitectura (diagrama de bloques)

```
┌─────────────────┐     HTTP/LAN      ┌──────────────────────┐
│  Clientes       │ ◄──────────────► │  PC / Servidor dev    │
│  (móvil, PC)    │   :3001          │  Next.js + Supabase   │
└─────────────────┘                   └──────────┬───────────┘
                                                 │ HTTPS (producción)
                                                 ▼
                                      ┌──────────────────────┐
                                      │  Vercel + Supabase     │
                                      │  (hosting + BaaS)      │
                                      └──────────────────────┘
```

| Componente | Estado | Notas |
|------------|--------|-------|
| PC / laptop desarrollo | ✅ | Corre `npm run dev` puerto 3001 |
| Red LAN Wi‑Fi/Ethernet | ✅ | Acceso desde otros dispositivos posible |
| Vercel (producción) | ❌ | Deploy pendiente (Fase 5.4) |
| Supabase Cloud | ✅ | PostgreSQL, Auth, Storage |

**Pendiente:**

- [ ] Diagrama de bloques en alta resolución (draw.io / Figma).

### 3.3 Software

#### Stack implementado (web)

| Capa | Tecnología | Estado |
|------|------------|--------|
| Frontend | Next.js 16, React 19, Tailwind 4 | ✅ |
| Backend | Supabase (PostgreSQL, Auth, Storage, RLS) | ✅ |
| Validación | Zod + react-hook-form | ✅ |
| IA nube (opcional) | Groq vision — carta de productos | ✅ opcional |

#### Diagrama de flujo general (web — implementado)

```
Usuario → Landing / Explorar (swiper)
       → Like / Guardar (requiere cuenta)
       → Detalle chaza → Reseña
       → Server Action → validación Zod
       → filtro profanidad (servidor)
       → INSERT reviews (Supabase)
       → Admin ve métricas + reportes
```

---

## 4. Desarrollo

### 4.1 Lo ya realizado (evidencia en código)

| Iteración | Entregable | Estado |
|-----------|------------|--------|
| Fase 0 | Landing, swiper flashcards, mapa base, legales | ✅ |
| Fase 1 | Supabase, auth, publicar chaza, favoritos, reseñas | ✅ |
| Fase 2 | Analytics DB, mapa con pins, panel admin | ✅ |
| Fase 3 | Reportes, moderación, `/mis-chazas` | ✅ |
| Fase 4 | CSV export, productos/carta, blog, Groq opcional | ✅ |
| Fase 5.1–5.3 | QR/compartir, badge verificada, destacados | ✅ |
| UX reciente | Fix hidratación swiper, categorías fondo blanco | ✅ |

### 4.2 Problemas encontrados y resueltos (para narrar en informe)

| Problema | Solución |
|----------|----------|
| Hydration mismatch en `ChazaSwiper` | Estado inicial unificado en `useChazaCatalog` + datos SSR vía `items` prop |
| Puerto 3001 ocupado | Documentar uso de un solo `next dev`; `kill PID` o reutilizar instancia |
| Sección categorías ilegible en blanco | Ajuste de colores `text-brand-red` |
| Deprecación middleware Next.js 16 | Aviso `middleware` → `proxy` (deuda menor) |

### 4.3 Pendiente en desarrollo

- [ ] Deploy Vercel + smoke Auth producción.
- [ ] Video bonus: acceso LAN desde otro dispositivo.

---

## 5. Prototipo final

| Entregable | Estado | Acción |
|------------|--------|--------|
| Capturas web (landing, swiper, mapa, admin) | 🟡 | Tomar screenshots HD; incluir móvil y desktop |
| Video demo flujo completo | ❌ | Grabar: explorar → like → reseña → admin |

**Rutas clave para evidencia visual:**

- `http://localhost:3001/` — landing + swiper
- `/explorar`, `/mapa`, `/chazas/[slug]`, `/admin/metricas`, `/publicar-chaza`

---

## 6. Pruebas y resultados

### 6.1 Pruebas ya posibles (software)

| Prueba | Estado | Cómo ejecutar |
|--------|--------|---------------|
| Registro / login | ✅ | `/registro`, `/login` |
| Publicar chaza | ✅ | `/publicar-chaza` + ver en `/explorar` |
| Swiper like/pass/undo | ✅ | Home o `/explorar` |
| Reseña + filtro profanidad | ✅ | Detalle chaza |
| Mapa pins | ✅ | `/mapa` |
| Admin métricas + CSV | ✅ | `/admin/metricas` |
| QR compartir | ✅ | Detalle / mis chazas |

Checklist manual: [`BUILD_PLAN.md`](BUILD_PLAN.md) § Checklist prueba manual Fase 1.

### 6.2 Pruebas pendientes (informe)

| Prueba | Métrica sugerida | Evidencia |
|--------|------------------|-----------|
| Acceso LAN | Otro móvil abre `:3001` | **Video bonus** |

### 6.3 Plantilla tabla de resultados

| ID | Caso | Entrada | Esperado | Obtenido | Pass/Fail |
|----|------|---------|----------|----------|-----------|
| T01 | Reseña positiva | "Excelente café" | publicada | — | — |
| T02 | Reseña negativa | "Muy lento el servicio" | publicada | — | — |
| T03 | Profanidad | texto ofensivo | rechazo servidor | — | — |

---

## 7. Viabilidad del producto y mercado

| Subsección | Estado | Fuente / nota |
|------------|--------|---------------|
| Público objetivo | ✅ | Estudiantes, visitantes, chazeros campus UN Bogotá |
| Problema que resuelve | ✅ | Descubrimiento centralizado de puestos informales |
| Costos estimados | 🟡 | Redactar tabla: hosting $0, dominio ~$12/año |
| Precio de venta | ✅ | $0 usuario final; monetización futura = publicidad destacada |
| Competencia | 🟡 | Instagram/WhatsApp grupal, boca a boca — documentar |
| Diferenciador | ✅ | Swiper + mapa campus + moderación + enfoque chazas UN |

**Pendiente:** tabla de costos BOM (solo software, $0 marginal).

---

## 8. Conclusiones

**Estado:** ❌ Por redactar al cierre del semestre.

**Puntos sugeridos:**

- Se logró un MVP web funcional que cubre el flujo completo visitante ↔ chazero.
- Moderación mediante filtro de profanidad en servidor y herramientas admin.
- Limitaciones: dependencia de Supabase, moderación basada en lista léxica.
- Trabajo futuro: deploy producción, PWA.

---

## 9. Referencias (formato IEEE — pendiente completar)

**Estado:** 🟡 Lista inicial; convertir a IEEE en informe final.

1. Next.js Team, *Next.js Documentation*, 2026. [Online]. Available: https://nextjs.org/docs  
2. Supabase Inc., *Supabase Documentation*, 2026. [Online]. Available: https://supabase.com/docs  
3. Vercel Inc., *Vercel Documentation*, 2026. [Online]. Available: https://vercel.com/docs  
4. Repositorio del proyecto: `https://github.com/sebastianvelace/ChazasUN-1.1` (ajustar URL real).

**Pendiente añadir:**

- React documentation, Zod, Tailwind CSS, Groq API docs.

---

## 10. Anexos (opcional)

| Anexo | Estado | Ubicación |
|-------|--------|-----------|
| Código completo | ✅ | Repositorio Git |
| Migraciones SQL | ✅ | `supabase/migrations/` |
| Diagrama arquitectura | 🟡 | [`ARCHITECTURE.md`](ARCHITECTURE.md) |
| Tablas de prueba | ❌ | § 6.3 plantilla arriba |

---

## Actividades bonus del curso

| Bonus | Relación con ChazasUN | Estado | Evidencia requerida |
|-------|----------------------|--------|---------------------|
| **Servidor en LAN** | `npm run dev` en `0.0.0.0:3001` o deploy LAN | 🟡 | Video: móvil en Wi‑Fi abre la web del PC |
| **Energías renovables** | Por definir profesor | ❌ | — |

### Cómo grabar el bonus LAN (guía rápida)

```bash
# En el PC servidor (misma red Wi‑Fi que el móvil)
npm run dev
# Next ya expone Network: http://192.168.x.x:3001
```

Desde el móvil, abrir esa IP y grabar pantalla: home → swiper → detalle chaza.

---

## Plan de trabajo recomendado (prioridad para cerrar informe)

### Semana A — Evidencias web

1. Screenshots profesionales (Figma o capturas limpias).
2. Video demo 3–5 min (flujo completo web).
3. Video bonus LAN.

### Semana B — Deploy y redacción

1. (Opcional) Deploy Vercel para URL pública en informe.
2. Redactar informe completo en Word/LaTeX con formato IEEE.

---

## Checklist rápido: ¿qué falta para entregar?

### Software (ChazasUN web)

- [x] MVP funcional local
- [ ] Deploy producción (Vercel)

### Informe académico

- [ ] Abstract inglés final
- [ ] Introducción redactada
- [ ] Diagramas (bloques, flujo, arquitectura)
- [ ] Fotos y videos
- [ ] Tabla de pruebas con resultados reales
- [ ] Viabilidad con números
- [ ] Conclusiones
- [ ] Referencias IEEE completas
- [ ] Revisión ortográfica / formato

---

## Mapa: requisitos del curso ↔ estado

| # Sección informe | Avance | Comentario |
|-------------------|--------|------------|
| 1 Abstract | 🟡 | Borrador arriba |
| 2 Introducción | 🟡 | Contenido en README; falta prosa |
| 3 Diseño sistema | 🟡 | Web diseñado; falta diagramas finales |
| 4 Desarrollo | 🟡 | Mucho hecho; narrar iteraciones |
| 5 Prototipo final | ❌ | Falta evidencia visual |
| 6 Pruebas y resultados | 🟡 | Pruebas manuales web; falta videos |
| 7 Viabilidad mercado | 🟡 | Ideas listas; falta redacción |
| 8 Conclusiones | ❌ | — |
| 9 Referencias IEEE | 🟡 | Lista inicial |
| 10 Anexos | 🟡 | Código sí; tablas de prueba no |

---

*Documento generado como guía para el informe de clase. Actualizar conforme avancen las evidencias del semestre.*

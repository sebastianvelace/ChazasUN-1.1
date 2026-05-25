# ChazasUN — Estado del proyecto para informe de clase

Documento de referencia para elaborar el informe final según la rúbrica del curso.  
Basado en [`README.md`](../README.md), [`BUILD_PLAN.md`](BUILD_PLAN.md) y el estado del repositorio (mayo 2026).

**Leyenda:** ✅ Hecho · 🟡 Parcial / borrador · ❌ Pendiente

---

## Resumen ejecutivo

| Área | Avance estimado | Comentario |
|------|-----------------|------------|
| **Software web (MVP)** | ~95 % | Plataforma funcional en local con Supabase |
| **Hardware / edge AI (Jetson)** | ~0–5 % | Planificado; no implementado aún |
| **Documentación de informe** | ~25 % | Este documento + README; falta redacción IEEE completa |
| **Evidencias (fotos, videos)** | ~10 % | Pendiente grabar y organizar |
| **Deploy producción** | ❌ | Fase 5.4 sin cerrar |

**Etapa actual:** fin de desarrollo de software (Fases 0–5.3) + inicio de integración edge AI y documentación académica.

---

## 1. Abstract

**Estado:** 🟡 Borrador (redactar en inglés, máx. 5 líneas)

**Borrador sugerido (ajustar tras pruebas con Jetson):**

> ChazasUN is a free web platform that helps university campus visitors discover informal food and service stalls (“chazas”) through a Tinder-like swiper, interactive map, and user reviews. The proposed system combines a Next.js frontend, Supabase backend, and an optional NVIDIA Jetson Orin Nano edge node for local sentiment analysis of comments to improve community moderation without sending review text to third-party cloud APIs. The current prototype runs on a local development server with authenticated publishing, favorites, analytics, and admin tools; edge AI integration and production deployment remain in progress.

**Pendiente:** actualizar con resultados medidos (latencia Jetson, precisión del modelo, URL de deploy).

---

## 2. Introducción

| Subsección | Estado | Contenido disponible |
|------------|--------|----------------------|
| Contexto del problema | ✅ | README § Visión — boca a boca, falta de catálogo centralizado en campus UN Bogotá |
| Necesidad identificada | ✅ | Descubrimiento de chazas, contacto, reseñas, visibilidad para emprendedores |
| Solución propuesta | ✅ | Marketplace web gratuito + swiper + mapa + moderación asistida por IA local |

**Pendiente para el informe:**

- [ ] Redactar en prosa académica (no solo bullets).
- [ ] Añadir párrafo sobre **por qué IA en edge** (privacidad, costo cero en inferencia, independencia de nube).
- [ ] Objetivos específicos medibles (ej.: “analizar sentimiento de reseñas en < 500 ms en Jetson”).

---

## 3. Diseño del sistema

### 3.1 Requerimientos

| Requerimiento | Estado | Detalle |
|---------------|--------|---------|
| Plataforma web responsive | ✅ | Next.js 16, mobile-first |
| Bajo costo operativo | ✅ | Stack gratuito (Supabase free tier, Vercel hobby) |
| Open-source / código propio | ✅ | Repositorio Git; dependencias OSS |
| Sin PII en analytics de navegación | ✅ | Sesión anónima + `analytics_events` |
| Moderación de comentarios | 🟡 | Filtro léxico (`lib/security/profanity.ts`); **falta análisis emocional Jetson** |
| Consumo / autonomía (Jetson) | ❌ | Documentar: Orin Nano ~7–15 W; alimentación USB-C 15 W o barrel 5 V/4 A |
| Servidor en LAN (bonus) | 🟡 | App accesible en red local (`192.168.x.x:3001`); falta video evidencia |
| IA entrenamiento / inferencia (bonus) | ❌ | Plan Jetson abajo |

**Restricciones a documentar en el informe:**

- Solo español (v1).
- Sin chat in-app ni pagos.
- Proyecto independiente, no oficial UN.
- Jetson solo en red local inicialmente (no exponer API sin autenticación).

### 3.2 Hardware

**Estado general:** 🟡 — El producto principal es software; el **componente hardware del informe** será el nodo Jetson.

#### Arquitectura propuesta (diagrama de bloques)

```
┌─────────────────┐     HTTP/LAN      ┌──────────────────────┐
│  Clientes       │ ◄──────────────► │  PC / Servidor dev    │
│  (móvil, PC)    │   :3001          │  Next.js + Supabase   │
└─────────────────┘                   └──────────┬───────────┘
                                                 │ REST (LAN)
                                                 ▼
                                      ┌──────────────────────┐
                                      │  NVIDIA Jetson         │
                                      │  Orin Nano             │
                                      │  ─────────────────     │
                                      │  • API inferencia      │
                                      │  • Modelo sentimiento  │
                                      │  • (futuro) visión     │
                                      └──────────────────────┘
```

| Componente | Estado | Notas |
|------------|--------|-------|
| PC / laptop desarrollo | ✅ | Corre `npm run dev` puerto 3001 |
| Red LAN Wi‑Fi/Ethernet | ✅ | Acceso desde otros dispositivos posible |
| NVIDIA Jetson Orin Nano | ❌ | Por integrar |
| Fuente de alimentación Jetson | ❌ | Documentar voltaje/corriente en informe |
| Carcasa 3D Jetson | ❌ | Opcional para prototipo final |
| PCB custom | ❌ | No requerido si usas Jetson dev kit; mencionar en informe |

**Pendiente:**

- [ ] Foto del banco de pruebas (laptop + Jetson + red).
- [ ] Esquema eléctrico simplificado (alimentación Jetson).
- [ ] Diagrama de bloques en alta resolución (draw.io / Figma).

### 3.3 Software

#### Stack implementado (web)

| Capa | Tecnología | Estado |
|------|------------|--------|
| Frontend | Next.js 16, React 19, Tailwind 4 | ✅ |
| Backend | Supabase (PostgreSQL, Auth, Storage, RLS) | ✅ |
| Validación | Zod + react-hook-form | ✅ |
| IA nube (opcional) | Groq vision — carta de productos | ✅ opcional |
| IA edge (planificado) | Jetson — sentimiento reseñas | ❌ |

#### Diagrama de flujo general (web — implementado)

```
Usuario → Landing / Explorar (swiper)
       → Like / Guardar (requiere cuenta)
       → Detalle chaza → Reseña
       → Server Action → validación Zod
       → filtro profanidad (servidor)
       → INSERT reviews (Supabase)
       → [PENDIENTE] POST /analyze → Jetson
       → guardar sentiment_score / emotion_label
       → Admin ve métricas + reportes
```

#### Flujo propuesto Jetson (por implementar)

```
1. Usuario publica reseña en /chazas/[slug]
2. Next.js (Server Action o Route Handler) envía texto a http://<JETSON_IP>:8080/analyze
3. Jetson: tokenización → modelo (ONNX/TensorRT o transformers)
4. Respuesta JSON: { label, score, emotions? }
5. App persiste en columna reviews.sentiment_* o tabla review_analysis
6. Admin: panel muestra distribución emocional / alertas
```

**Modelos candidatos (Jetson, español):**

- Fine-tune de `distilbert-base-multilingual-cased` (sentimiento 3 clases).
- O modelo ligero ONNX exportado para TensorRT.
- Alternativa rápida MVP: `pysentimiento` / `transformers` pipeline en CPU/GPU Jetson.

**Pendiente software Jetson:**

- [ ] Repo o carpeta `edge/` con servicio FastAPI.
- [ ] Script de inferencia + requirements (`jetson-containers` o venv ARM).
- [ ] Variable `JETSON_INFERENCE_URL` en `.env.local`.
- [ ] Migración SQL: campos `sentiment_label`, `sentiment_score`, `analyzed_at`.
- [ ] Integración en `lib/actions/reviews.ts` (fallback si Jetson offline).
- [ ] Panel admin: gráfico de sentimiento.

**Futuro en Jetson (post-MVP clase):**

- Clasificación de toxicidad más allá de lista de palabras.
- Resumen de reseñas por chaza.
- Visión: validación de fotos de carta local (sin Groq).

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

- [ ] Integración Jetson (servicio + API + DB).
- [ ] Deploy Vercel + smoke Auth producción.
- [ ] Entrenamiento o fine-tuning del modelo (dataset de reseñas en español).
- [ ] Video bonus: acceso LAN desde otro dispositivo.
- [ ] Video bonus: inferencia en Jetson en tiempo real.

---

## 5. Prototipo final

| Entregable | Estado | Acción |
|------------|--------|--------|
| Capturas web (landing, swiper, mapa, admin) | 🟡 | Tomar screenshots HD; incluir móvil y desktop |
| Video demo flujo completo | ❌ | Grabar: explorar → like → reseña → admin |
| Jetson montado / banco de pruebas | ❌ | Foto + descripción conexiones |
| Carcasa 3D | ❌ | Diseñar en Fusion360/FreeCAD si aplica |
| PCB | ❌ | N/A dev kit, o diagrama alimentación |
| Simulaciones | ❌ | Opcional: latencia inferencia, consumo Watt |

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

### 6.2 Pruebas pendientes (Jetson + informe)

| Prueba | Métrica sugerida | Evidencia |
|--------|------------------|-----------|
| Latencia inferencia | ms por reseña (p50, p95) | Tabla + captura |
| Precisión sentimiento | Accuracy/F1 vs dataset etiquetado | Matriz confusión |
| Disponibilidad Jetson offline | App sigue publicando reseña | Video fallback |
| Acceso LAN | Otro móvil abre `:3001` | **Video bonus** |
| Inferencia Jetson | Texto → emoción en terminal/UI | **Video bonus IA** |

### 6.3 Plantilla tabla de resultados

| ID | Caso | Entrada | Esperado | Obtenido | Pass/Fail |
|----|------|---------|----------|----------|-----------|
| T01 | Reseña positiva | "Excelente café" | label positivo | — | — |
| T02 | Reseña negativa | "Muy lento el servicio" | label negativo | — | — |
| T03 | Profanidad | texto ofensivo | rechazo servidor | — | — |
| T04 | Jetson apagado | reseña válida | guardada sin score | — | — |

---

## 7. Viabilidad del producto y mercado

| Subsección | Estado | Fuente / nota |
|------------|--------|---------------|
| Público objetivo | ✅ | Estudiantes, visitantes, chazeros campus UN Bogotá |
| Problema que resuelve | ✅ | Descubrimiento centralizado de puestos informales |
| Costos estimados | 🟡 | Redactar tabla: hosting $0, dominio ~$12/año, Jetson ~$499 (amortizable) |
| Precio de venta | ✅ | $0 usuario final; monetización futura = publicidad destacada |
| Competencia | 🟡 | Instagram/WhatsApp grupal, boca a boca — documentar |
| Diferenciador | ✅ | Swiper + mapa campus + IA moderación local + enfoque chazas UN |

**Pendiente:** tabla de costos BOM (Bill of Materials) si incluyes Jetson en el producto.

---

## 8. Conclusiones

**Estado:** ❌ Por redactar al cierre del semestre.

**Puntos sugeridos:**

- Se logró un MVP web funcional que cubre el flujo completo visitante ↔ chazero.
- La integración Jetson aporta diferenciación académica (edge AI + privacidad).
- Limitaciones: dependencia de Supabase, modelo de sentimiento por validar en español coloquial.
- Trabajo futuro: deploy producción, PWA, más modelos en Jetson.

---

## 9. Referencias (formato IEEE — pendiente completar)

**Estado:** 🟡 Lista inicial; convertir a IEEE en informe final.

1. Next.js Team, *Next.js Documentation*, 2026. [Online]. Available: https://nextjs.org/docs  
2. Supabase Inc., *Supabase Documentation*, 2026. [Online]. Available: https://supabase.com/docs  
3. NVIDIA Corp., *Jetson Orin Nano Developer Kit User Guide*, 2024. [Online]. Available: https://developer.nvidia.com/embedded/jetson-orin-nano-developer-kit  
4. Vercel Inc., *Vercel Documentation*, 2026. [Online]. Available: https://vercel.com/docs  
5. Repositorio del proyecto: `https://github.com/sebastianvelace/ChazasUN-1.1` (ajustar URL real).

**Pendiente añadir:**

- Paper o dataset de sentimiento en español usado para entrenamiento.
- Hoja de datos Jetson Orin Nano (consumo, GPIO si aplica).
- React documentation, Zod, Tailwind CSS.

---

## 10. Anexos (opcional)

| Anexo | Estado | Ubicación |
|-------|--------|-----------|
| Código completo | ✅ | Repositorio Git |
| Migraciones SQL | ✅ | `supabase/migrations/` |
| Diagrama arquitectura | 🟡 | [`ARCHITECTURE.md`](ARCHITECTURE.md) |
| Código Jetson | ❌ | Crear `edge/jetson-sentiment/` |
| CAD carcasa | ❌ | — |
| Tablas de prueba | ❌ | § 6.3 plantilla arriba |
| Logs entrenamiento IA | ❌ | Tras fine-tune |

---

## Actividades bonus del curso

| Bonus | Relación con ChazasUN | Estado | Evidencia requerida |
|-------|----------------------|--------|---------------------|
| **Servidor en LAN** | `npm run dev` en `0.0.0.0:3001` o deploy LAN | 🟡 | Video: móvil en Wi‑Fi abre la web del PC |
| **Entrenamiento IA** | Modelo sentimiento/emoción en Jetson | ❌ | Video inferencia + archivos dataset/notebook |
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

### Semana A — Jetson MVP

1. Crear servicio Python en Jetson (`FastAPI` + modelo sentimiento español).
2. Probar con `curl` desde la laptop.
3. Añadir `JETSON_INFERENCE_URL` y hook en server action de reseñas.
4. Migración SQL para guardar resultados.
5. Gráfico simple en `/admin/metricas`.

### Semana B — Evidencias y deploy

1. Screenshots profesionales (Figma o capturas limpias).
2. Video demo 3–5 min (web + Jetson).
3. Video bonus LAN.
4. (Opcional) Deploy Vercel para URL pública en informe.
5. Redactar informe completo en Word/LaTeX con formato IEEE.

---

## Checklist rápido: ¿qué falta para entregar?

### Software (ChazasUN web)

- [x] MVP funcional local
- [ ] Deploy producción (Vercel)
- [ ] Integración Jetson sentimiento
- [ ] Documentar API edge en README o `docs/EDGE_AI.md`

### Informe académico

- [ ] Abstract inglés final
- [ ] Introducción redactada
- [ ] Diagramas (bloques, flujo, arquitectura)
- [ ] Sección hardware Jetson con specs
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
| 3 Diseño sistema | 🟡 | Web diseñado; Jetson por documentar |
| 4 Desarrollo | 🟡 | Mucho hecho; narrar iteraciones |
| 5 Prototipo final | ❌ | Falta evidencia visual |
| 6 Pruebas y resultados | 🟡 | Pruebas manuales web; falta Jetson + videos |
| 7 Viabilidad mercado | 🟡 | Ideas listas; falta redacción |
| 8 Conclusiones | ❌ | — |
| 9 Referencias IEEE | 🟡 | Lista inicial |
| 10 Anexos | 🟡 | Código sí; CAD/Jetson no |

---

*Documento generado como guía para el informe de clase. Actualizar conforme avance la integración con Jetson Orin Nano y las evidencias del semestre.*

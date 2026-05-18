/** Eventos de producto — sin PII; sesión anónima para métricas de entrega. */

export type AnalyticsEventName =
  | "page_view"
  | "swiper_view"
  | "swiper_like"
  | "swiper_pass"
  | "swiper_save"
  | "swiper_undo"
  | "swiper_card_time"
  | "category_click"
  | "cta_explorar"
  | "cta_publicar_chaza"
  | "auth_prompt_shown"
  | "auth_prompt_dismissed"
  | "map_pin_click"

export interface AnalyticsEventPayload {
  path?: string
  chazaId?: string
  categorySlug?: string
  /** Tiempo en ms viendo una tarjeta del swiper. */
  durationMs?: number
  /** Posición en el mazo (flashcards). */
  deckIndex?: number
}

export interface AnalyticsEvent {
  name: AnalyticsEventName
  payload?: AnalyticsEventPayload
  timestamp: string
  sessionId: string
}

/** Claves localStorage (prototipo sin DB). */

export const STORAGE_KEYS = {
  session: "chazasun_mock_session",
  likedIds: "chazasun_liked_ids",
  savedIds: "chazasun_saved_ids",
  publishedChazas: "chazasun_published_chazas",
  reviews: "chazasun_reviews",
  analyticsOptIn: "chazasun_analytics_opt_in",
  /** Acceso al panel de metricas (demo / ?demo=1). */
  adminMetricsUnlock: "chazasun_admin_metrics_unlock",
} as const

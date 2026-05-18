const SESSION_KEY = "chazasun_analytics_session"

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}

/** Sesión anónima persistente (sin email ni nombre). */
export function getAnalyticsSessionId(): string {
  if (typeof window === "undefined") return "server"

  try {
    let id = sessionStorage.getItem(SESSION_KEY)
    if (!id) {
      id = generateId()
      sessionStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return generateId()
  }
}

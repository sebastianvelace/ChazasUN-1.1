import { STORAGE_KEYS } from "@/lib/storage/keys"

export function unlockAdminMetricsFromQuery(): void {
  if (typeof window === "undefined") return
  if (process.env.NODE_ENV !== "development") return
  try {
    const q = new URLSearchParams(window.location.search)
    if (q.get("demo") === "1") {
      window.localStorage.setItem(STORAGE_KEYS.adminMetricsUnlock, "1")
    }
  } catch {
    /* ignore */
  }
}

export function isAdminMetricsUnlocked(): boolean {
  if (typeof window === "undefined") return false
  try {
    if (process.env.NODE_ENV === "development") return true
    return false
  } catch {
    return false
  }
}

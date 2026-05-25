const DEFAULT_NEXT = "/explorar"

/**
 * Returns a safe relative path for post-auth redirects.
 * Rejects open redirects (protocol-relative, absolute URLs, backslashes, etc.).
 */
export function safeNextPath(raw: string | null | undefined, fallback = DEFAULT_NEXT): string {
  if (!raw || typeof raw !== "string") return fallback

  let decoded = raw.trim()
  for (let i = 0; i < 2; i++) {
    try {
      const next = decodeURIComponent(decoded)
      if (next === decoded) break
      decoded = next
    } catch {
      return fallback
    }
  }

  if (!decoded.startsWith("/")) return fallback
  if (decoded.startsWith("//")) return fallback
  if (decoded.includes("\\")) return fallback
  if (decoded.includes("@")) return fallback

  const lower = decoded.toLowerCase()
  if (lower.includes("http://") || lower.includes("https://")) return fallback
  if (/[\0\r\n]/.test(decoded)) return fallback

  return decoded
}

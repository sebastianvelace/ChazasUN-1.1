/** IDs de usuario con acceso admin (server). Coma-separados en ADMIN_USER_IDS. */
export function getAdminUserIds(): Set<string> {
  const raw = process.env.ADMIN_USER_IDS ?? ""
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  )
}

export function isAdminUserId(userId: string | undefined | null): boolean {
  if (!userId) return false
  const ids = getAdminUserIds()
  if (ids.size > 0) return ids.has(userId)
  return false
}

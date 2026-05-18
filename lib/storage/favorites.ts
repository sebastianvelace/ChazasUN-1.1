"use client"

import { STORAGE_KEYS } from "@/lib/storage/keys"

function parseIds(raw: string | null): string[] {
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : []
  } catch {
    return []
  }
}

export function getLikedIdsFromStorage(): string[] {
  if (typeof window === "undefined") return []
  return parseIds(window.localStorage.getItem(STORAGE_KEYS.likedIds))
}

export function setLikedIdsInStorage(ids: string[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEYS.likedIds, JSON.stringify(ids))
    window.dispatchEvent(new CustomEvent("chazasun-favorites"))
  } catch {
    /* ignore */
  }
}

export function toggleLikeInStorage(id: string): string[] {
  const prev = getLikedIdsFromStorage()
  const next = prev.includes(id) ? prev : [...prev, id]
  setLikedIdsInStorage(next)
  return next
}

export function getSavedIdsFromStorage(): string[] {
  if (typeof window === "undefined") return []
  return parseIds(window.localStorage.getItem(STORAGE_KEYS.savedIds))
}

export function setSavedIdsInStorage(ids: string[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEYS.savedIds, JSON.stringify(ids))
    window.dispatchEvent(new CustomEvent("chazasun-favorites"))
  } catch {
    /* ignore */
  }
}

export function toggleSaveInStorage(id: string): string[] {
  const prev = getSavedIdsFromStorage()
  const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  setSavedIdsInStorage(next)
  return next
}

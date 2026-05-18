"use client"

import type { ChazaCard } from "@/types/chaza"
import { STORAGE_KEYS } from "@/lib/storage/keys"

export function getPublishedChazasFromStorage(): ChazaCard[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.publishedChazas)
    if (!raw) return []
    const arr = JSON.parse(raw) as unknown
    if (!Array.isArray(arr)) return []
    return arr.filter((c): c is ChazaCard => typeof c === "object" && c !== null && "id" in c && "slug" in c)
  } catch {
    return []
  }
}

export function setPublishedChazasInStorage(chazas: ChazaCard[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEYS.publishedChazas, JSON.stringify(chazas))
    window.dispatchEvent(new CustomEvent("chazasun-published"))
  } catch {
    /* ignore */
  }
}

export function appendPublishedChaza(card: ChazaCard): ChazaCard[] {
  const prev = getPublishedChazasFromStorage()
  const next = [...prev.filter((c) => c.id !== card.id), card]
  setPublishedChazasInStorage(next)
  return next
}

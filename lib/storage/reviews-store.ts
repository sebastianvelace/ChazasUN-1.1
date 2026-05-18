"use client"

import type { Review } from "@/types/review"
import { STORAGE_KEYS } from "@/lib/storage/keys"

function readAll(): Review[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.reviews)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed.filter((r) => r && typeof r === "object") as Review[]) : []
  } catch {
    return []
  }
}

function writeAll(list: Review[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(list))
    window.dispatchEvent(new CustomEvent("chazasun-reviews"))
  } catch {
    /* ignore quota */
  }
}

export function getStoredReviewsForChaza(chazaId: string): Review[] {
  return readAll()
    .filter((r) => r.chazaId === chazaId && r.status === "published")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function appendReview(review: Review): void {
  const all = readAll()
  writeAll([...all, review])
}

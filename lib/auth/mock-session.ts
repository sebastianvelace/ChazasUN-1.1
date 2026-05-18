"use client"

import { STORAGE_KEYS } from "@/lib/storage/keys"

export interface MockUser {
  id: string
  email: string
  displayName: string
}

function readRaw(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(STORAGE_KEYS.session)
  } catch {
    return null
  }
}

export function getMockSession(): MockUser | null {
  const raw = readRaw()
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as MockUser
    if (parsed?.id && parsed?.email) return parsed
  } catch {
    /* ignore */
  }
  return null
}

export function setMockSession(user: MockUser): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(user))
    window.dispatchEvent(new CustomEvent("chazasun-auth"))
  } catch {
    /* ignore */
  }
}

export function clearMockSession(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(STORAGE_KEYS.session)
    window.dispatchEvent(new CustomEvent("chazasun-auth"))
  } catch {
    /* ignore */
  }
}

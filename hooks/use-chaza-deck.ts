"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

export interface UseChazaDeckOptions<T extends { id: string }> {
  items: T[]
  /** Si se pasan, inicializan y resincronizan likes/guardados (p. ej. desde localStorage al iniciar sesion). */
  initialLikedIds?: string[]
  initialSavedIds?: string[]
}

export interface DeckHistoryEntry {
  queueSnapshot: string[]
  action: "like" | "pass"
  chazaId: string
}

/**
 * Mazo tipo flashcards: al pasar o like, la tarjeta va al final del mazo (nunca se oculta para siempre).
 */
export function useChazaDeck<T extends { id: string }>({
  items,
  initialLikedIds = [],
  initialSavedIds = [],
}: UseChazaDeckOptions<T>) {
  const itemMap = useMemo(() => new Map(items.map((i) => [i.id, i])), [items])

  const [queue, setQueue] = useState<string[]>(() => items.map((i) => i.id))
  const [likedIds, setLikedIds] = useState<string[]>(initialLikedIds)
  const [savedIds, setSavedIds] = useState<string[]>(initialSavedIds)
  const [history, setHistory] = useState<DeckHistoryEntry[]>([])
  const initialLikedIdsKey = JSON.stringify(initialLikedIds)
  const initialSavedIdsKey = JSON.stringify(initialSavedIds)

  useEffect(() => {
    setQueue(items.map((i) => i.id))
    setHistory([])
  }, [items])

  useEffect(() => {
    setLikedIds(JSON.parse(initialLikedIdsKey) as string[])
  }, [initialLikedIdsKey])

  useEffect(() => {
    setSavedIds(JSON.parse(initialSavedIdsKey) as string[])
  }, [initialSavedIdsKey])

  const currentId = queue[0]
  const current = currentId ? itemMap.get(currentId) : undefined
  const nextId = queue[1]
  const thirdId = queue[2]
  const next = nextId ? itemMap.get(nextId) : undefined
  const third = thirdId ? itemMap.get(thirdId) : undefined

  const rotateToEnd = useCallback((id: string) => {
    setQueue((prev) => {
      if (prev.length <= 1) return prev
      const idx = prev.indexOf(id)
      if (idx === -1) return prev
      const nextQueue = [...prev]
      const [removed] = nextQueue.splice(idx, 1)
      nextQueue.push(removed)
      return nextQueue
    })
  }, [])

  const advance = useCallback(
    (action: "like" | "pass") => {
      if (!currentId) return
      setHistory((h) => [
        ...h,
        { queueSnapshot: [...queue], action, chazaId: currentId },
      ])
      if (action === "like") {
        setLikedIds((prev) => (prev.includes(currentId) ? prev : [...prev, currentId]))
      }
      rotateToEnd(currentId)
    },
    [currentId, queue, rotateToEnd]
  )

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h
      const last = h[h.length - 1]
      setQueue(last.queueSnapshot)
      if (last.action === "like") {
        setLikedIds((prev) => prev.filter((id) => id !== last.chazaId))
      }
      return h.slice(0, -1)
    })
  }, [])

  const toggleSave = useCallback((id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }, [])

  const setSavedIdsExternal = useCallback((ids: string[]) => {
    setSavedIds(ids)
  }, [])

  return {
    queue,
    current,
    next,
    third,
    likedIds,
    savedIds,
    history,
    canUndo: history.length > 0,
    advance,
    undo,
    toggleSave,
    setSavedIdsExternal,
    deckSize: queue.length,
  }
}

"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSession } from "@/hooks/use-session"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"
import {
  getLikedIdsFromStorage,
  getSavedIdsFromStorage,
  toggleLikeInStorage,
  toggleSaveInStorage,
} from "@/lib/storage/favorites"
import { getFavoritesAction, toggleFavoriteAction } from "@/lib/actions/favorites"

export function useFavorites() {
  const { isLoggedIn, ready } = useSession()
  const useRemote = Boolean(getSupabaseBrowserEnv())

  const [likedIds, setLikedIds] = useState<string[]>([])
  const [savedIds, setSavedIds] = useState<string[]>([])

  const load = useCallback(async () => {
    if (!isLoggedIn) {
      setLikedIds([])
      setSavedIds([])
      return
    }
    if (!useRemote) {
      setLikedIds(getLikedIdsFromStorage())
      setSavedIds(getSavedIdsFromStorage())
      return
    }
    const res = await getFavoritesAction()
    if (res.ok) {
      setLikedIds(res.liked)
      setSavedIds(res.saved)
    }
  }, [isLoggedIn, useRemote])

  useEffect(() => {
    if (!ready) return
    void load()
  }, [ready, load])

  useEffect(() => {
    const fn = () => void load()
    window.addEventListener("chazasun-favorites", fn)
    return () => window.removeEventListener("chazasun-favorites", fn)
  }, [load])

  const addLike = useCallback(
    async (chazaId: string) => {
      if (!isLoggedIn) return
      if (!useRemote) {
        toggleLikeInStorage(chazaId)
        setLikedIds(getLikedIdsFromStorage())
        window.dispatchEvent(new CustomEvent("chazasun-favorites"))
        return
      }
      const res = await toggleFavoriteAction(chazaId, "like")
      if (res.ok) {
        setLikedIds(res.liked)
        setSavedIds(res.saved)
        window.dispatchEvent(new CustomEvent("chazasun-favorites"))
      }
    },
    [isLoggedIn, useRemote]
  )

  const toggleSave = useCallback(
    async (chazaId: string) => {
      if (!isLoggedIn) return
      if (!useRemote) {
        toggleSaveInStorage(chazaId)
        setSavedIds(getSavedIdsFromStorage())
        window.dispatchEvent(new CustomEvent("chazasun-favorites"))
        return
      }
      const res = await toggleFavoriteAction(chazaId, "save")
      if (res.ok) {
        setLikedIds(res.liked)
        setSavedIds(res.saved)
        window.dispatchEvent(new CustomEvent("chazasun-favorites"))
      }
    },
    [isLoggedIn, useRemote]
  )

  return useMemo(
    () => ({
      likedIds,
      savedIds,
      reload: load,
      addLike,
      toggleSave,
      useRemote,
    }),
    [likedIds, savedIds, load, addLike, toggleSave, useRemote]
  )
}

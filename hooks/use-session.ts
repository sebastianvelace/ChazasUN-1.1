"use client"

import { useCallback, useEffect, useState } from "react"
import type { SessionUser } from "@/lib/auth/session-user"
import { mapSupabaseUserToSession } from "@/lib/auth/session-user"
import {
  clearMockSession,
  getMockSession,
  type MockUser,
} from "@/lib/auth/mock-session"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"

function mockToSession(u: MockUser): SessionUser {
  return { id: u.id, email: u.email, displayName: u.displayName }
}

/**
 * Sesion: Supabase si hay env, si no fallback mock (desarrollo sin proyecto).
 */
export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [ready, setReady] = useState(false)
  const useDb = Boolean(getSupabaseBrowserEnv())

  useEffect(() => {
    if (!useDb) {
      setUser(getMockSession() ? mockToSession(getMockSession()!) : null)
      setReady(true)
      const onAuth = () => {
        const m = getMockSession()
        setUser(m ? mockToSession(m) : null)
      }
      window.addEventListener("chazasun-auth", onAuth)
      return () => window.removeEventListener("chazasun-auth", onAuth)
    }

    const supabase = createBrowserSupabaseClient()

    const sync = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user ? mapSupabaseUserToSession(data.user) : null)
      setReady(true)
    }

    void sync()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? mapSupabaseUserToSession(session.user) : null)
    })

    return () => subscription.unsubscribe()
  }, [useDb])

  const logout = useCallback(async () => {
    if (!useDb) {
      clearMockSession()
      setUser(null)
      return
    }
    const supabase = createBrowserSupabaseClient()
    await supabase.auth.signOut()
    setUser(null)
  }, [useDb])

  return {
    user,
    isLoggedIn: user !== null,
    logout,
    /** false hasta primera lectura de sesion (evita flash en UI exigente) */
    ready,
    useSupabase: useDb,
  }
}

"use client"

import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import Link from "next/link"
import { Heart, X, MapPin, Star, Clock, RotateCcw, Info, Bookmark, Search } from "lucide-react"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { useChazaDeck } from "@/hooks/use-chaza-deck"
import { useAnalytics, useCardDwellTime } from "@/hooks/use-analytics"
import { useChazaCatalog } from "@/hooks/use-chaza-catalog"
import { useSession } from "@/hooks/use-session"
import { useFavorites } from "@/hooks/use-favorites"
import { inferCategorySlugsFromLabel } from "@/lib/data/chaza-repository"
import {
  getLikedIdsFromStorage,
  getSavedIdsFromStorage,
  toggleLikeInStorage,
  toggleSaveInStorage,
} from "@/lib/storage/favorites"
import { siteConfig } from "@/config/site"
import type { ChazaCard } from "@/types/chaza"
import { AuthPromptDialog, type AuthPromptReason } from "@/components/auth/auth-prompt-dialog"
import { ChazaVerifiedBadge } from "@/components/chazas/chaza-verified-badge"
import { ChazaGridCard } from "@/components/chazas/chaza-grid-card"

const SWIPE_THRESHOLD = 100

export interface ChazaSwiperProps {
  items?: ChazaCard[]
  categoryFilter?: string | null
  sectionId?: string
  showSectionHeader?: boolean
  showViewAllLink?: boolean
  /** Barra de busqueda por nombre (cliente). */
  showNameSearch?: boolean
  /** Franja horizontal arriba del swiper (servidor); no altera el orden del mazo. */
  featuredStrip?: ChazaCard[]
}

export function ChazaSwiper({
  items: itemsProp,
  categoryFilter = null,
  sectionId,
  showSectionHeader = true,
  showViewAllLink = false,
  showNameSearch = false,
  featuredStrip,
}: ChazaSwiperProps) {
  const { cards } = useChazaCatalog()
  const { isLoggedIn } = useSession()
  const { likedIds: favLikedIds, savedIds: favSavedIds, addLike, toggleSave: remoteToggleSave, useRemote } =
    useFavorites()

  const [favSync, setFavSync] = useState<{ liked: string[]; saved: string[] }>({
    liked: [],
    saved: [],
  })

  useEffect(() => {
    if (!isLoggedIn) {
      setFavSync({ liked: [], saved: [] })
      return
    }
    if (useRemote) {
      setFavSync({ liked: favLikedIds, saved: favSavedIds })
      return
    }
    setFavSync({
      liked: getLikedIdsFromStorage(),
      saved: getSavedIdsFromStorage(),
    })
  }, [isLoggedIn, useRemote, favLikedIds, favSavedIds])

  useEffect(() => {
    if (!isLoggedIn || useRemote) return
    const fn = () => {
      setFavSync({
        liked: getLikedIdsFromStorage(),
        saved: getSavedIdsFromStorage(),
      })
    }
    window.addEventListener("chazasun-favorites", fn)
    return () => window.removeEventListener("chazasun-favorites", fn)
  }, [isLoggedIn, useRemote])

  const [nameQuery, setNameQuery] = useState("")

  const source = itemsProp ?? cards
  const filtered = useMemo(() => {
    let list = !categoryFilter
      ? source
      : source.filter((c) =>
          (c.categorySlugs ?? inferCategorySlugsFromLabel(c.category)).includes(categoryFilter)
        )
    const q = nameQuery.trim().toLowerCase()
    if (q) {
      list = list.filter((c) => c.name.toLowerCase().includes(q))
    }
    return list
  }, [source, categoryFilter, nameQuery])

  const featuredVisible = useMemo(() => {
    if (!featuredStrip?.length) return []
    let list = featuredStrip
    if (categoryFilter) {
      list = list.filter((c) =>
        (c.categorySlugs ?? inferCategorySlugsFromLabel(c.category)).includes(categoryFilter)
      )
    }
    const q = nameQuery.trim().toLowerCase()
    if (q) {
      list = list.filter((c) => c.name.toLowerCase().includes(q))
    }
    return list
  }, [featuredStrip, categoryFilter, nameQuery])

  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  const [authPrompt, setAuthPrompt] = useState<AuthPromptReason | null>(null)

  const { track } = useAnalytics()

  const requireAuth = useCallback(
    (reason: AuthPromptReason) => {
      setAuthPrompt(reason)
      track("auth_prompt_shown", { path: reason })
    },
    [track]
  )

  const {
    current,
    next,
    likedIds,
    savedIds,
    canUndo,
    advance: deckAdvance,
    undo,
    toggleSave,
    queue,
  } = useChazaDeck({
    items: filtered,
    initialLikedIds: favSync.liked,
    initialSavedIds: favSync.saved,
  })

  const { ref: sectionRef, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.15 })

  const startX = useRef(0)
  const currentX = useRef(0)
  const cardRef = useRef<HTMLDivElement>(null)

  useCardDwellTime(current?.id, (durationMs, chazaId) => {
    track("swiper_card_time", { chazaId, durationMs })
  })

  const handleAdvance = useCallback(
    (direction: "like" | "pass") => {
      if (!current) return
      if (direction === "like") {
        if (!isLoggedIn) {
          requireAuth("like")
          setOffset(0)
          return
        }
        setExitDirection("right")
        track("swiper_like", {
          chazaId: current.id,
          deckIndex: queue.indexOf(current.id),
        })
        setShowInfo(false)
        const likedId = current.id
        setTimeout(() => {
          deckAdvance("like")
          if (useRemote) {
            void addLike(likedId)
          } else {
            toggleLikeInStorage(likedId)
            window.dispatchEvent(new CustomEvent("chazasun-favorites"))
          }
          setOffset(0)
          setExitDirection(null)
        }, 350)
        return
      }
      setExitDirection("left")
      track("swiper_pass", {
        chazaId: current.id,
        deckIndex: queue.indexOf(current.id),
      })
      setShowInfo(false)
      setTimeout(() => {
        deckAdvance("pass")
        setOffset(0)
        setExitDirection(null)
      }, 350)
    },
    [current, deckAdvance, queue, track, requireAuth, isLoggedIn, useRemote, addLike]
  )

  const handleUndo = useCallback(() => {
    undo()
    track("swiper_undo")
    setShowInfo(false)
  }, [undo, track])

  const handleSave = useCallback(() => {
    if (!current) return
    if (!isLoggedIn) {
      requireAuth("save")
      return
    }
    if (useRemote) {
      void remoteToggleSave(current.id)
    } else {
      toggleSaveInStorage(current.id)
      toggleSave(current.id)
    }
  }, [current, requireAuth, isLoggedIn, toggleSave, useRemote, remoteToggleSave])

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return
    setIsDragging(true)
    startX.current = e.clientX
    currentX.current = e.clientX
    cardRef.current?.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    currentX.current = e.clientX
    setOffset(currentX.current - startX.current)
  }

  const onPointerUp = () => {
    if (!isDragging) return
    setIsDragging(false)
    const delta = currentX.current - startX.current
    if (delta > SWIPE_THRESHOLD) {
      handleAdvance("like")
    } else if (delta < -SWIPE_THRESHOLD) handleAdvance("pass")
    else setOffset(0)
  }

  const rotation = offset / 25
  const likeOpacity = Math.min(Math.max(offset / SWIPE_THRESHOLD, 0), 1)
  const skipOpacity = Math.min(Math.max(-offset / SWIPE_THRESHOLD, 0), 1)

  if (filtered.length === 0) {
    return (
      <section
        ref={sectionRef}
        {...(sectionId ? { id: sectionId } : {})}
        className="py-20 px-4 bg-white overflow-hidden"
      >
        <div className="mx-auto max-w-lg text-center">
          {featuredVisible.length > 0 && (
            <div className="mb-10 text-left w-full max-w-full">
              <p className="font-stencil text-sm text-gray-500 tracking-wide mb-1">DESTACADAS</p>
              <p className="text-xs text-gray-400 mb-3">
                Campañas del equipo; el explorador sigue siendo igual para todas.
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                {featuredVisible.map((chaza) => (
                  <div key={chaza.slug} className="w-[200px] sm:w-[220px] shrink-0">
                    <ChazaGridCard chaza={chaza} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {showSectionHeader && (
            <div className={`mb-8 scroll-reveal-up ${isVisible ? "visible" : ""}`}>
              <h2 className="font-stencil text-4xl text-brand-red mb-3">EXPLORA CHAZAS</h2>
            </div>
          )}
          <p className="text-gray-600 text-sm">
            {nameQuery.trim()
              ? "No hay chazas con ese nombre. Prueba otra palabra."
              : "No hay chazas para mostrar con este filtro."}
          </p>
        </div>
      </section>
    )
  }

  const getCardStyle = (): React.CSSProperties => {
    if (exitDirection === "right") {
      return {
        transform: "translateX(120%) rotate(20deg)",
        opacity: 0,
        transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      }
    }
    if (exitDirection === "left") {
      return {
        transform: "translateX(-120%) rotate(-20deg)",
        opacity: 0,
        transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      }
    }
    return {
      transform: `translateX(${offset}px) rotate(${rotation}deg)`,
      transition: isDragging ? "none" : "transform 0.3s cubic-bezier(.25,.8,.25,1)",
      touchAction: "pan-y",
    }
  }

  if (!current) return null

  const currentIndexInQueue = queue.indexOf(current.id)
  const isSaved = savedIds.includes(current.id)

  return (
    <section
      ref={sectionRef}
      {...(sectionId ? { id: sectionId } : {})}
      className="py-20 px-4 bg-white overflow-hidden"
    >
      <div className="mx-auto max-w-lg">
        {featuredVisible.length > 0 && (
          <div className="mb-10 max-w-full">
            <p className="font-stencil text-sm text-gray-500 tracking-wide mb-1 text-center sm:text-left">
              DESTACADAS
            </p>
            <p className="text-xs text-gray-400 mb-3 text-center sm:text-left max-w-sm mx-auto sm:mx-0">
              Campañas del equipo; el explorador sigue siendo igual para todas.
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 justify-center sm:justify-start">
              {featuredVisible.map((chaza) => (
                <div key={chaza.slug} className="w-[200px] sm:w-[220px] shrink-0">
                  <ChazaGridCard chaza={chaza} />
                </div>
              ))}
            </div>
          </div>
        )}
        {showSectionHeader && (
          <div className={`text-center mb-10 scroll-reveal-up ${isVisible ? "visible" : ""}`}>
            <span className="inline-block bg-brand-red/10 text-brand-red text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              Descubre
            </span>
            <h2 className="font-stencil text-4xl sm:text-5xl text-brand-red mb-3 tracking-wide">
              EXPLORA CHAZAS
            </h2>
            {categoryFilter && (
              <p className="text-brand-red/80 text-xs font-semibold uppercase tracking-wider mb-2">
                Filtro activo
              </p>
            )}
            <p className="text-gray-500 max-w-sm mx-auto text-sm leading-relaxed">
              Desliza a la derecha si te interesa. Al pasar, la chaza vuelve al final del mazo — como
              flashcards.
            </p>
            {showViewAllLink && (
              <Link
                href={siteConfig.urls.explorar}
                className="inline-block mt-4 font-stencil text-sm text-brand-red hover:underline"
              >
                VER EXPLORACION COMPLETA →
              </Link>
            )}
            {showNameSearch && (
              <div className="relative max-w-sm mx-auto mt-6 text-left">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="search"
                  value={nameQuery}
                  onChange={(e) => setNameQuery(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="w-full rounded-full border border-gray-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/20"
                  aria-label="Buscar chaza por nombre"
                />
              </div>
            )}
          </div>
        )}

        <div
          className={`relative w-full max-w-[340px] mx-auto h-[520px] select-none mb-8 scroll-reveal-scale stagger-1 ${isVisible ? "visible" : ""}`}
        >
          <div
            className="absolute inset-x-4 top-4 bottom-4 bg-white rounded-3xl shadow-sm border border-gray-100 scale-90 opacity-50"
            aria-hidden
          />

          {next && (
            <div
              className="absolute inset-x-2 top-2 bottom-2 bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden scale-95 opacity-80"
              aria-hidden
            >
              <img src={next.image} alt="" className="w-full h-full object-cover" draggable={false} />
            </div>
          )}

          <div
            ref={cardRef}
            className="absolute inset-0 bg-white rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing border border-gray-100"
            style={getCardStyle()}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <div className="absolute inset-0">
              <img
                src={current.image}
                alt={current.name}
                className="w-full h-full object-cover pointer-events-none"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>

            <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2 z-10">
              <div className="flex flex-wrap items-center gap-1.5 min-w-0 max-w-[55%]">
                <span className="bg-brand-red text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg shrink-0">
                  {current.category}
                </span>
                {current.verifiedAt ? <ChazaVerifiedBadge size="compact" className="shadow-md" /> : null}
              </div>
              <div className="flex items-center gap-1 bg-white/95 px-2.5 py-1.5 rounded-full shadow shrink-0">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-semibold text-gray-800">{current.rating}</span>
                <span className="text-xs text-gray-400">({current.reviews})</span>
              </div>
            </div>

            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
              style={{ opacity: likeOpacity }}
              aria-hidden
            >
              <div className="border-4 border-green-400 rounded-2xl px-8 py-3 -rotate-[15deg] bg-green-400/20 backdrop-blur-sm shadow-2xl">
                <span className="text-green-400 font-stencil text-4xl tracking-widest drop-shadow-lg">
                  LIKE
                </span>
              </div>
            </div>

            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
              style={{ opacity: skipOpacity }}
              aria-hidden
            >
              <div className="border-4 border-red-400 rounded-2xl px-8 py-3 rotate-[15deg] bg-red-400/20 backdrop-blur-sm shadow-2xl">
                <span className="text-red-400 font-stencil text-4xl tracking-widest drop-shadow-lg">
                  PASS
                </span>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
              <Link href={`/chazas/${current.slug}`}>
                <h3 className="font-stencil text-2xl text-white mb-2 tracking-wide drop-shadow-lg hover:underline">
                  {current.name}
                </h3>
              </Link>
              <div className="flex items-center gap-1.5 text-white/80 text-xs mb-3">
                <MapPin className="w-3.5 h-3.5" />
                <span>{current.location}</span>
              </div>

              <div
                className={`overflow-hidden transition-all duration-300 ${showInfo ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <p className="text-white/90 text-sm leading-relaxed mb-3">{current.description}</p>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-3.5 h-3.5 text-white/70" />
                  <span className="text-white/70 text-xs">{current.schedule}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {current.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-white/20 text-white px-2.5 py-1 rounded-full text-xs backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className="bg-white/20 backdrop-blur-sm text-white font-semibold text-sm px-3 py-1 rounded-full">
                  Desde {current.price}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowInfo(!showInfo)
                  }}
                  className="text-white/70 hover:text-white transition-colors p-1"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={`flex items-center justify-center gap-4 scroll-reveal-up stagger-2 ${isVisible ? "visible" : ""}`}>
          <button
            type="button"
            onClick={handleUndo}
            disabled={!canUndo}
            className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-yellow-500 shadow-lg hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            aria-label="Deshacer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => handleAdvance("pass")}
            className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-xl hover:scale-110 hover:border-red-400 hover:bg-red-50 active:scale-95"
            aria-label="Pasar"
          >
            <X className="w-8 h-8 text-red-400" />
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={`w-12 h-12 rounded-full bg-white border-2 flex items-center justify-center shadow-lg active:scale-95 ${
              isSaved ? "border-blue-400 bg-blue-50" : "border-gray-200"
            }`}
            aria-label="Guardar"
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? "text-blue-500 fill-blue-500" : "text-blue-400"}`} />
          </button>
          <button
            type="button"
            onClick={() => handleAdvance("like")}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl active:scale-95"
            aria-label="Me interesa"
          >
            <Heart className="w-8 h-8 text-white" />
          </button>
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className={`w-12 h-12 rounded-full bg-white border-2 flex items-center justify-center shadow-lg active:scale-95 ${
              showInfo ? "border-purple-400 bg-purple-50" : "border-gray-200"
            }`}
            aria-label="Mas informacion"
          >
            <Info className={`w-5 h-5 ${showInfo ? "text-purple-500" : "text-purple-400"}`} />
          </button>
        </div>

        <div className={`flex justify-center gap-1.5 mt-6 scroll-reveal-up stagger-3 ${isVisible ? "visible" : ""}`}>
          {queue.map((id, i) => (
            <div
              key={id}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === currentIndexInQueue ? "w-8 bg-brand-red" : "w-1.5 bg-gray-200"
              }`}
            />
          ))}
        </div>

        <div
          className={`flex items-center justify-center gap-8 mt-6 text-center scroll-reveal-up stagger-4 ${isVisible ? "visible" : ""}`}
        >
          {likedIds.length > 0 && (
            <div>
              <p className="font-stencil text-2xl text-green-500">{likedIds.length}</p>
              <p className="text-gray-400 text-xs">Likes</p>
            </div>
          )}
          {savedIds.length > 0 && (
            <div>
              <p className="font-stencil text-2xl text-blue-500">{savedIds.length}</p>
              <p className="text-gray-400 text-xs">Guardadas</p>
            </div>
          )}
        </div>

        <p className={`text-center text-gray-300 text-xs mt-6 scroll-reveal-up stagger-5 ${isVisible ? "visible" : ""}`}>
          Arrastra la tarjeta o usa los botones · Las chazas vuelven al mazo · Like y guardar requieren cuenta
        </p>
      </div>

      <AuthPromptDialog
        open={authPrompt !== null}
        onOpenChange={(open) => !open && setAuthPrompt(null)}
        reason={authPrompt ?? "like"}
      />
    </section>
  )
}

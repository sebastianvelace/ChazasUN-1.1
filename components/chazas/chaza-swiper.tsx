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
import { categories } from "@/config/categories"
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
  const { cards, loading: catalogLoading } = useChazaCatalog()
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

  // ── TAREA 1: Internal category filter state ──
  const [activeCategory, setActiveCategory] = useState<string | null>(categoryFilter ?? null)

  // Sync activeCategory when the categoryFilter prop changes
  useEffect(() => {
    setActiveCategory(categoryFilter ?? null)
  }, [categoryFilter])

  const source = itemsProp ?? cards
  const filtered = useMemo(() => {
    let list = !activeCategory
      ? source
      : source.filter((c) =>
          (c.categorySlugs ?? inferCategorySlugsFromLabel(c.category)).includes(activeCategory)
        )
    const q = nameQuery.trim().toLowerCase()
    if (q) {
      list = list.filter((c) => c.name.toLowerCase().includes(q))
    }
    return list
  }, [source, activeCategory, nameQuery])

  const featuredVisible = useMemo(() => {
    if (!featuredStrip?.length) return []
    let list = featuredStrip
    if (activeCategory) {
      list = list.filter((c) =>
        (c.categorySlugs ?? inferCategorySlugsFromLabel(c.category)).includes(activeCategory)
      )
    }
    const q = nameQuery.trim().toLowerCase()
    if (q) {
      list = list.filter((c) => c.name.toLowerCase().includes(q))
    }
    return list
  }, [featuredStrip, activeCategory, nameQuery])

  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  const [authPrompt, setAuthPrompt] = useState<AuthPromptReason | null>(null)

  // ── TAREA 3: Onboarding hint ──
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined" && !localStorage.getItem("chazasun_swiper_onboarded")) {
        setShowHint(true)
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const dismissHint = useCallback(() => {
    setShowHint(false)
    if (typeof window !== "undefined") {
      localStorage.setItem("chazasun_swiper_onboarded", "1")
    }
  }, [])

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
      // Dismiss hint on first real swipe
      dismissHint()
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
        }, 400)
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
      }, 400)
    },
    [current, deckAdvance, queue, track, requireAuth, isLoggedIn, useRemote, addLike, dismissHint]
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
    if ((e.target as HTMLElement).closest("button, a")) return
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

  // ── TAREA 1: Category pills component (shared) ──
  const CategoryPills = (
    <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
      <button
        type="button"
        onClick={() => setActiveCategory(null)}
        className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
          activeCategory === null
            ? "bg-brand-red text-white font-semibold"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        Todas
      </button>
      {categories.map((cat) => (
        <button
          key={cat.slug}
          type="button"
          onClick={() => setActiveCategory(cat.slug === activeCategory ? null : cat.slug)}
          className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
            activeCategory === cat.slug
              ? "bg-brand-red text-white font-semibold"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )

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
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x-mandatory">
                {featuredVisible.map((chaza) => (
                  <div key={chaza.slug} className="w-[200px] sm:w-[220px] shrink-0 snap-start">
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
          <div className="mb-6">{CategoryPills}</div>
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
    const ease = "cubic-bezier(0.22, 1, 0.36, 1)"
    if (exitDirection === "right") {
      return {
        transform: "translateX(105%) rotate(12deg)",
        opacity: 0,
        transition: `transform 0.4s ${ease}, opacity 0.4s ${ease}`,
      }
    }
    if (exitDirection === "left") {
      return {
        transform: "translateX(-105%) rotate(-12deg)",
        opacity: 0,
        transition: `transform 0.4s ${ease}, opacity 0.4s ${ease}`,
      }
    }
    return {
      transform: `translateX(${offset}px) rotate(${rotation}deg)`,
      transition: isDragging ? "none" : `transform 0.35s ${ease}`,
      touchAction: "pan-y",
    }
  }

  const showLoading = !itemsProp && catalogLoading && cards.length === 0

  if (showLoading) {
    return (
      <section
        ref={sectionRef}
        {...(sectionId ? { id: sectionId } : {})}
        className="py-20 px-4 bg-white overflow-hidden"
      >
        <div className="mx-auto max-w-lg">
          {showSectionHeader && (
            <div className="text-center mb-10">
              <div className="h-8 w-48 bg-gray-100 rounded-full mx-auto mb-4 animate-pulse" />
              <div className="h-4 w-64 bg-gray-100 rounded mx-auto animate-pulse" />
            </div>
          )}
          <div className="relative w-full max-w-[340px] mx-auto h-[520px] rounded-3xl bg-gray-100 animate-pulse" />
        </div>
      </section>
    )
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
      <div className="mx-auto max-w-6xl">
        {/* Featured strip */}
        {featuredVisible.length > 0 && (
          <div className="mb-10 max-w-full">
            <p className="font-stencil text-sm text-gray-500 tracking-wide mb-1 text-center sm:text-left">
              DESTACADAS
            </p>
            <p className="text-xs text-gray-400 mb-3 text-center sm:text-left max-w-sm mx-auto sm:mx-0">
              Campañas del equipo; el explorador sigue siendo igual para todas.
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 justify-center sm:justify-start snap-x-mandatory">
              {featuredVisible.map((chaza) => (
                <div key={chaza.slug} className="w-[200px] sm:w-[220px] shrink-0 snap-start">
                  <ChazaGridCard chaza={chaza} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Two-column layout: card left, controls right (desktop) / stacked (mobile) */}
        <div className="lg:flex lg:items-center lg:gap-16 lg:justify-center">

          {/* ── CARD COLUMN ── */}
          <div className="lg:flex-none lg:w-[460px] xl:w-[500px]">

            {/* Mobile-only header (above card) */}
            {showSectionHeader && (
              <div className="lg:hidden text-center mb-6 animate-auth-in">
                <span className="inline-block bg-brand-red/10 text-brand-red text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                  Descubre
                </span>
                <h2 className="font-stencil text-4xl sm:text-5xl text-brand-red mb-3 tracking-wide">
                  EXPLORA CHAZAS
                </h2>
                <p className="text-gray-500 max-w-sm mx-auto text-sm leading-relaxed">
                  Desliza a la derecha si te interesa. Al pasar, la chaza vuelve al final del mazo — como flashcards.
                </p>
                {showViewAllLink && (
                  <Link href={siteConfig.urls.explorar} className="inline-block mt-4 font-stencil text-sm text-brand-red hover:underline">
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

            {/* Mobile-only: category pills (between header and card stack) */}
            <div className="lg:hidden mb-4">
              {CategoryPills}
            </div>

            {/* Card stack */}
            <div className="relative w-full max-w-[340px] lg:max-w-none mx-auto h-[520px] lg:h-[620px] select-none mb-8 lg:mb-0">
              <div className="absolute inset-x-4 top-4 bottom-4 bg-white rounded-3xl shadow-sm border border-gray-100 scale-90 opacity-50" aria-hidden />

              {next && (
                <div className="absolute inset-x-2 top-2 bottom-2 bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden scale-95 opacity-80" aria-hidden>
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
                  <img src={current.image} alt={current.name} className="w-full h-full object-cover pointer-events-none" draggable={false} />
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

                {/* ── TAREA 2: Undo button inside card, top-right, visible only when canUndo ── */}
                {canUndo && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleUndo() }}
                    className="absolute top-3 right-3 z-30 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md text-yellow-500 hover:bg-yellow-50 transition-colors"
                    aria-label="Deshacer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20" style={{ opacity: likeOpacity }} aria-hidden>
                  <div className="border-4 border-green-400 rounded-2xl px-8 py-3 -rotate-[15deg] bg-green-400/20 backdrop-blur-sm shadow-2xl">
                    <span className="text-green-400 font-stencil text-4xl tracking-widest drop-shadow-lg">LIKE</span>
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20" style={{ opacity: skipOpacity }} aria-hidden>
                  <div className="border-4 border-red-400 rounded-2xl px-8 py-3 rotate-[15deg] bg-red-400/20 backdrop-blur-sm shadow-2xl">
                    <span className="text-red-400 font-stencil text-4xl tracking-widest drop-shadow-lg">PASS</span>
                  </div>
                </div>

                {/* ── TAREA 3: Onboarding hint overlay ── */}
                {showHint && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-3xl bg-black/30 backdrop-blur-[2px] pointer-events-none">
                    <div className="flex items-center gap-8 mb-4">
                      <div className="flex flex-col items-center gap-1 animate-pulse">
                        <span className="text-white text-3xl">←</span>
                        <span className="text-white font-stencil text-sm tracking-widest">PASS</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-white/70 text-sm font-stencil tracking-wide">desliza</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 animate-pulse">
                        <span className="text-white text-3xl">→</span>
                        <span className="text-white font-stencil text-sm tracking-widest">LIKE</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={dismissHint}
                      className="pointer-events-auto mt-2 px-5 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-full border border-white/40 transition-colors backdrop-blur-sm"
                    >
                      Entendido
                    </button>
                  </div>
                )}

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
                  <div className={`overflow-hidden transition-all duration-300 ${showInfo ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                    <p className="text-white/90 text-sm leading-relaxed mb-3">{current.description}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-3.5 h-3.5 text-white/70" />
                      <span className="text-white/70 text-xs">{current.schedule}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {current.tags.map((tag) => (
                        <span key={tag} className="bg-white/20 text-white px-2.5 py-1 rounded-full text-xs backdrop-blur-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="bg-white/20 backdrop-blur-sm text-white font-semibold text-sm px-3 py-1 rounded-full">
                      Desde {current.price}
                    </span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setShowInfo(!showInfo) }} className="text-white/70 hover:text-white transition-colors p-1">
                      <Info className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile-only: buttons + dots + stats */}
            {/* ── TAREA 2: 3 buttons (Pass · Like · Guardar) on mobile ── */}
            <div className="lg:hidden mt-8">
              <div className="flex items-center justify-center gap-4">
                <button type="button" onClick={() => handleAdvance("pass")} className="btn-swiper-action w-16 h-16 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-md hover:border-red-300 hover:bg-red-50/80" aria-label="Pasar">
                  <X className="w-8 h-8 text-red-400" />
                </button>
                <button type="button" onClick={() => handleAdvance("like")} className="btn-swiper-action w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-md" aria-label="Me interesa">
                  <Heart className="w-8 h-8 text-white" />
                </button>
                <button type="button" onClick={handleSave} className={`btn-swiper-action w-14 h-14 rounded-full bg-white border-2 flex items-center justify-center shadow-md ${isSaved ? "border-blue-400 bg-blue-50" : "border-gray-200"}`} aria-label="Guardar">
                  <Bookmark className={`w-5 h-5 ${isSaved ? "text-blue-500 fill-blue-500" : "text-blue-400"}`} />
                </button>
              </div>
              <div className="flex justify-center gap-1.5 mt-6">
                {queue.map((id, i) => (
                  <div key={id} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIndexInQueue ? "w-8 bg-brand-red" : "w-1.5 bg-gray-200"}`} />
                ))}
              </div>
              <div className="flex items-center justify-center gap-8 mt-6 text-center">
                {likedIds.length > 0 && <div><p className="font-stencil text-2xl text-green-500">{likedIds.length}</p><p className="text-gray-400 text-xs">Likes</p></div>}
                {savedIds.length > 0 && <div><p className="font-stencil text-2xl text-blue-500">{savedIds.length}</p><p className="text-gray-400 text-xs">Guardadas</p></div>}
              </div>
              <p className="text-center text-gray-300 text-xs mt-6">
                Arrastra la tarjeta o usa los botones · Las chazas vuelven al mazo · Like y guardar requieren cuenta
              </p>
            </div>
          </div>

          {/* ── CONTROLS COLUMN (desktop only) ── */}
          <div className="hidden lg:flex flex-col flex-none w-[340px] xl:w-[380px]">

            {showSectionHeader && (
              <div className={`mb-10 scroll-reveal-up ${isVisible ? "visible" : ""}`}>
                <span className="inline-block bg-brand-red/10 text-brand-red text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
                  Descubre
                </span>
                <h2 className="font-stencil text-5xl xl:text-6xl text-brand-red mb-4 tracking-wide leading-none">
                  EXPLORA<br />CHAZAS
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">
                  Desliza a la derecha si te interesa. Al pasar, la chaza vuelve al final del mazo — como flashcards.
                </p>
                {showViewAllLink && (
                  <Link href={siteConfig.urls.explorar} className="inline-block font-stencil text-sm text-brand-red hover:underline">
                    VER EXPLORACION COMPLETA →
                  </Link>
                )}
                {showNameSearch && (
                  <div className="relative mt-5">
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
                {/* Desktop: category pills below search bar */}
                <div className="mt-5">
                  {CategoryPills}
                </div>
              </div>
            )}

            {/* If no section header, still render pills on desktop */}
            {!showSectionHeader && (
              <div className="mb-6">
                {CategoryPills}
              </div>
            )}

            {/* Progress dots */}
            <div className="flex gap-1.5 mb-8">
              {queue.map((id, i) => (
                <div key={id} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIndexInQueue ? "w-8 bg-brand-red" : "w-1.5 bg-gray-200"}`} />
              ))}
            </div>

            {/* ── TAREA 2: 3 action buttons on desktop ── */}
            <div className="flex items-center gap-3 mb-8">
              <button type="button" onClick={() => handleAdvance("pass")} className="btn-swiper-action w-[4.5rem] h-[4.5rem] rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-md hover:border-red-300 hover:bg-red-50/80" aria-label="Pasar">
                <X className="w-9 h-9 text-red-400" />
              </button>
              <button type="button" onClick={() => handleAdvance("like")} className="btn-swiper-action w-[4.5rem] h-[4.5rem] rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-md" aria-label="Me interesa">
                <Heart className="w-9 h-9 text-white" />
              </button>
              <button type="button" onClick={handleSave} className={`btn-swiper-action w-14 h-14 rounded-full bg-white border-2 flex items-center justify-center shadow-md ${isSaved ? "border-blue-400 bg-blue-50" : "border-gray-200"}`} aria-label="Guardar">
                <Bookmark className={`w-6 h-6 ${isSaved ? "text-blue-500 fill-blue-500" : "text-blue-400"}`} />
              </button>
            </div>

            {/* Stats */}
            {(likedIds.length > 0 || savedIds.length > 0) && (
              <div className="flex items-center gap-8 mb-6">
                {likedIds.length > 0 && <div><p className="font-stencil text-2xl text-green-500">{likedIds.length}</p><p className="text-gray-400 text-xs">Likes</p></div>}
                {savedIds.length > 0 && <div><p className="font-stencil text-2xl text-blue-500">{savedIds.length}</p><p className="text-gray-400 text-xs">Guardadas</p></div>}
              </div>
            )}

            <p className="text-gray-300 text-xs">
              Arrastra la tarjeta o usa los botones · Las chazas vuelven al mazo · Like y guardar requieren cuenta
            </p>
          </div>

        </div>
      </div>

      <AuthPromptDialog
        open={authPrompt !== null}
        onOpenChange={(open) => !open && setAuthPrompt(null)}
        reason={authPrompt ?? "like"}
        nextPath={siteConfig.urls.explorar}
      />
    </section>
  )
}

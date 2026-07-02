"use client"

import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import Link from "next/link"
import { Heart, X, MapPin, Star, Clock, RotateCcw, Info, Bookmark, Search, ArrowLeft, ArrowRight } from "lucide-react"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { useChazaDeck } from "@/hooks/use-chaza-deck"
import { useAnalytics, useCardDwellTime } from "@/hooks/use-analytics"
import { useChazaCatalog } from "@/hooks/use-chaza-catalog"
import { useSession } from "@/hooks/use-session"
import { useFavorites } from "@/hooks/use-favorites"
import { gsap } from "@/lib/gsap"
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

  const [isDragging, setIsDragging] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [authPrompt, setAuthPrompt] = useState<AuthPromptReason | null>(null)
  const [viewCount, setViewCount] = useState(0)

  useEffect(() => {
    setViewCount(0)
  }, [activeCategory, nameQuery])

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
  const dragOffset = useRef(0)
  const cardRef = useRef<HTMLDivElement>(null)
  const likeStampRef = useRef<HTMLDivElement>(null)
  const passStampRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useRef(false)

  useCardDwellTime(current?.id, (durationMs, chazaId) => {
    track("swiper_card_time", { chazaId, durationMs })
  })

  useEffect(() => {
    reducedMotion.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  useEffect(() => {
    const card = cardRef.current
    if (!card) return
    dragOffset.current = 0
    gsap.killTweensOf(card)
    gsap.set(card, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, clearProps: "xPercent" })
    gsap.set([likeStampRef.current, passStampRef.current], { opacity: 0, scale: 0.92 })
    if (!reducedMotion.current) {
      gsap.fromTo(card, { y: 18, scale: 0.985 }, { y: 0, scale: 1, duration: 0.38, ease: "power3.out" })
    }
  }, [current?.id])

  const resetCard = useCallback(() => {
    dragOffset.current = 0
    gsap.to(cardRef.current, { x: 0, rotation: 0, scale: 1, duration: 0.34, ease: "elastic.out(1, 0.72)" })
    gsap.to([likeStampRef.current, passStampRef.current], { opacity: 0, scale: 0.92, duration: 0.18 })
  }, [])

  const animateCardExit = useCallback(
    (direction: "like" | "pass", onComplete: () => void) => {
      const card = cardRef.current
      const stamp = direction === "like" ? likeStampRef.current : passStampRef.current
      if (!card || reducedMotion.current) {
        onComplete()
        return
      }
      const xPercent = direction === "like" ? 118 : -118
      const rotation = direction === "like" ? 14 : -14
      gsap.timeline({ onComplete })
        .to(stamp, { opacity: 1, scale: 1, duration: 0.12, ease: "power2.out" }, 0)
        .to(card, { xPercent, x: 0, rotation, opacity: 0, duration: 0.36, ease: "power3.in" }, 0.04)
    },
    []
  )

  const handleAdvance = useCallback(
    (direction: "like" | "pass") => {
      if (!current) return
      // Dismiss hint on first real swipe
      dismissHint()
      if (direction === "like") {
        if (!isLoggedIn) {
          requireAuth("like")
          resetCard()
          return
        }
        track("swiper_like", {
          chazaId: current.id,
          deckIndex: queue.indexOf(current.id),
        })
        setShowInfo(false)
        setViewCount((count) => count + 1)
        const likedId = current.id
        animateCardExit("like", () => {
          deckAdvance("like")
          if (useRemote) {
            void addLike(likedId)
          } else {
            toggleLikeInStorage(likedId)
            window.dispatchEvent(new CustomEvent("chazasun-favorites"))
          }
        })
        return
      }
      track("swiper_pass", {
        chazaId: current.id,
        deckIndex: queue.indexOf(current.id),
      })
      setShowInfo(false)
      setViewCount((count) => count + 1)
      animateCardExit("pass", () => {
        deckAdvance("pass")
      })
    },
    [current, deckAdvance, queue, track, requireAuth, isLoggedIn, useRemote, addLike, dismissHint, resetCard, animateCardExit]
  )

  const handleUndo = useCallback(() => {
    undo()
    setViewCount((count) => Math.max(0, count - 1))
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
    gsap.killTweensOf(cardRef.current)
    setIsDragging(true)
    startX.current = e.clientX
    currentX.current = e.clientX
    cardRef.current?.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    currentX.current = e.clientX
    const delta = currentX.current - startX.current
    dragOffset.current = delta
    const rotation = delta / 25
    const likeOpacity = Math.min(Math.max(delta / SWIPE_THRESHOLD, 0), 1)
    const passOpacity = Math.min(Math.max(-delta / SWIPE_THRESHOLD, 0), 1)
    gsap.set(cardRef.current, { x: delta, rotation, scale: 0.992 })
    gsap.set(likeStampRef.current, { opacity: likeOpacity, scale: 0.92 + likeOpacity * 0.12 })
    gsap.set(passStampRef.current, { opacity: passOpacity, scale: 0.92 + passOpacity * 0.12 })
  }

  const onPointerUp = () => {
    if (!isDragging) return
    setIsDragging(false)
    const delta = dragOffset.current
    if (delta > SWIPE_THRESHOLD) {
      handleAdvance("like")
    } else if (delta < -SWIPE_THRESHOLD) handleAdvance("pass")
    else resetCard()
  }

  // ── TAREA 1: Category pills component (shared) ──
  const CategoryPills = (
    <div
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:flex-wrap lg:justify-start lg:overflow-visible lg:px-0"
      role="group"
      aria-label="Filtrar por categoría"
    >
      <button
        type="button"
        onClick={() => setActiveCategory(null)}
        aria-pressed={activeCategory === null}
        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
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
          aria-pressed={activeCategory === cat.slug}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
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
        className="overflow-hidden bg-white px-4 py-12 lg:py-20"
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

  const showLoading = !itemsProp && catalogLoading && cards.length === 0

  if (showLoading) {
    return (
      <section
        ref={sectionRef}
        {...(sectionId ? { id: sectionId } : {})}
        className="overflow-hidden bg-white px-4 py-12 lg:py-20"
      >
        <div className="mx-auto max-w-lg">
          {showSectionHeader && (
            <div className="text-center mb-10">
              <div className="h-8 w-48 bg-gray-100 rounded-full mx-auto mb-4 animate-pulse" />
              <div className="h-4 w-64 bg-gray-100 rounded mx-auto animate-pulse" />
            </div>
          )}
          <div className="relative mx-auto h-[clamp(340px,calc(100dvh_-_410px_-_env(safe-area-inset-bottom)),520px)] w-full max-w-[340px] animate-pulse rounded-3xl bg-gray-100 lg:h-[620px]" />
        </div>
      </section>
    )
  }

  if (!current) return null

  const progressPosition = queue.length > 0 ? (viewCount % queue.length) + 1 : 0
  const progressPercent = queue.length > 0 ? (progressPosition / queue.length) * 100 : 0
  const isSaved = savedIds.includes(current.id)

  return (
    <section
      ref={sectionRef}
      {...(sectionId ? { id: sectionId } : {})}
      className="overflow-hidden bg-white px-4 pb-4 pt-3 md:py-14 lg:py-20"
    >
      <div className="mx-auto max-w-6xl">
        {/* Featured strip */}
        {featuredVisible.length > 0 && (
          <div className="mb-10 hidden max-w-full lg:block">
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
              <div className="mb-3 text-left lg:hidden">
                <div className="flex items-end justify-between gap-3">
                  <h2 className="whitespace-nowrap font-stencil text-2xl leading-none tracking-wide text-brand-red sm:text-4xl">
                    EXPLORA CHAZAS
                  </h2>
                  <p className="shrink-0 text-xs font-medium text-gray-600">
                    Desliza o usa los botones
                  </p>
                </div>
                {showViewAllLink && (
                  <Link href={siteConfig.urls.explorar} className="mt-2 inline-block font-stencil text-sm text-brand-red hover:underline">
                    VER EXPLORACION COMPLETA →
                  </Link>
                )}
                {showNameSearch && (
                  <div className="relative mt-3 text-left">
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
            <div className="mb-3 lg:hidden">
              {CategoryPills}
            </div>

            {/* Card stack */}
            <div className="relative mx-auto h-[clamp(340px,calc(100dvh_-_410px_-_env(safe-area-inset-bottom)),520px)] w-full max-w-[340px] select-none lg:mb-0 lg:h-[620px] lg:max-w-none">
              <div className="absolute inset-x-4 top-4 bottom-4 bg-white rounded-3xl shadow-sm border border-gray-100 scale-90 opacity-50" aria-hidden />

              {next && (
                <div className="absolute inset-x-2 top-2 bottom-2 bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden scale-95 opacity-80" aria-hidden>
                  <img src={next.image} alt="" className="w-full h-full object-cover" draggable={false} />
                </div>
              )}

              <div
                ref={cardRef}
                className="absolute inset-0 bg-white rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing border border-gray-100"
                style={{ touchAction: "pan-y" }}
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
                    className="absolute right-4 top-14 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-red shadow-md transition-colors hover:bg-red-50"
                    aria-label="Deshacer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}

                <div ref={likeStampRef} className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 opacity-0" aria-hidden>
                  <div className="border-4 border-green-400 rounded-2xl px-8 py-3 -rotate-[15deg] bg-green-400/20 backdrop-blur-sm shadow-2xl">
                    <span className="text-green-400 font-stencil text-4xl tracking-widest drop-shadow-lg">INTERESA</span>
                  </div>
                </div>

                <div ref={passStampRef} className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 opacity-0" aria-hidden>
                  <div className="border-4 border-red-400 rounded-2xl px-8 py-3 rotate-[15deg] bg-red-400/20 backdrop-blur-sm shadow-2xl">
                    <span className="text-red-400 font-stencil text-4xl tracking-widest drop-shadow-lg">PASAR</span>
                  </div>
                </div>

                {/* ── TAREA 3: Onboarding hint overlay ── */}
                {showHint && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-3xl bg-black/30 backdrop-blur-[2px] pointer-events-none">
                    <div className="flex items-center gap-8 mb-4">
                      <div className="flex flex-col items-center gap-1 animate-pulse">
                        <ArrowLeft className="h-8 w-8 text-white" aria-hidden />
                        <span className="text-white font-stencil text-sm tracking-widest">PASAR</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-white/70 text-sm font-stencil tracking-wide">desliza</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 animate-pulse">
                        <ArrowRight className="h-8 w-8 text-white" aria-hidden />
                        <span className="text-white font-stencil text-sm tracking-widest">ME INTERESA</span>
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

            {/* Mobile-only: explicit actions and compact progress */}
            <div className="mt-3 lg:hidden">
              <div className="flex items-start justify-center gap-7">
                <div className="flex flex-col items-center gap-1">
                  <button type="button" onClick={() => handleAdvance("pass")} className="btn-swiper-action flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-200 bg-white shadow-sm hover:border-gray-300 hover:bg-gray-50" aria-label="Pasar">
                    <X className="h-6 w-6 text-gray-600" />
                  </button>
                  <span className="text-[11px] font-medium text-gray-600">Pasar</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <button type="button" onClick={() => handleAdvance("like")} className="btn-swiper-action flex h-14 w-14 items-center justify-center rounded-full bg-brand-red shadow-md shadow-brand-red/20 hover:bg-brand-red-dark" aria-label="Me interesa">
                    <Heart className="h-7 w-7 text-white" />
                  </button>
                  <span className="text-[11px] font-semibold text-brand-red">Me interesa</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <button type="button" onClick={handleSave} className={`btn-swiper-action flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white shadow-sm ${isSaved ? "border-brand-red bg-red-50" : "border-gray-200 hover:border-brand-red/40"}`} aria-label={isSaved ? "Quitar de guardadas" : "Guardar"}>
                    <Bookmark className={`h-5 w-5 ${isSaved ? "fill-brand-red text-brand-red" : "text-gray-600"}`} />
                  </button>
                  <span className="text-[11px] font-medium text-gray-600">Guardar</span>
                </div>
              </div>
              <div className="mx-auto mt-3 flex max-w-[260px] items-center gap-3" aria-label={`Tarjeta ${progressPosition} de ${queue.length}`}>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full rounded-full bg-brand-red transition-[width] duration-300" style={{ width: `${progressPercent}%` }} />
                </div>
                <span className="min-w-9 text-right text-[11px] font-semibold tabular-nums text-gray-600">
                  {progressPosition}/{queue.length}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-center gap-8 text-center">
                {likedIds.length > 0 && <div><p className="font-stencil text-2xl text-green-500">{likedIds.length}</p><p className="text-gray-400 text-xs">Likes</p></div>}
                {savedIds.length > 0 && <div><p className="font-stencil text-2xl text-blue-500">{savedIds.length}</p><p className="text-gray-400 text-xs">Guardadas</p></div>}
              </div>
              <p className="mt-3 text-center text-xs text-gray-600">
                Las chazas vuelven al mazo. Me interesa y guardar requieren cuenta.
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
                  Desliza a la derecha si te interesa. Al pasar, la chaza vuelve al final del mazo, como una flashcard.
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

            {/* Compact progress remains legible with large decks. */}
            <div className="mb-8 flex max-w-[260px] items-center gap-3" aria-label={`Tarjeta ${progressPosition} de ${queue.length}`}>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div className="h-full rounded-full bg-brand-red transition-[width] duration-300" style={{ width: `${progressPercent}%` }} />
              </div>
              <span className="text-xs font-semibold tabular-nums text-gray-600">
                {progressPosition}/{queue.length}
              </span>
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

            <p className="text-xs text-gray-600">
              Arrastra la tarjeta o usa los botones. Las chazas vuelven al mazo. Me interesa y guardar requieren cuenta.
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

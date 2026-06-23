"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowLeft,
  Bookmark,
  Clock,
  Flag,
  Heart,
  MapPin,
  MessageCircle,
  Navigation,
  PackageOpen,
  ShieldCheck,
  Star,
} from "lucide-react"
import { ChazaShareButton } from "@/components/chazas/chaza-share-button"
import { AuthPromptDialog, type AuthPromptReason } from "@/components/auth/auth-prompt-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PageContainer } from "@/components/layout"
import { googleMapsPlaceUrl } from "@/lib/maps/google-maps"
import { useChazaCatalog } from "@/hooks/use-chaza-catalog"
import { useFavorites } from "@/hooks/use-favorites"
import { useSession } from "@/hooks/use-session"
import { getSeedReviewsForChazaCard } from "@/lib/constants/mock-reviews"
import { appendReview, getStoredReviewsForChaza } from "@/lib/storage/reviews-store"
import { checkProfanity } from "@/lib/security/profanity"
import { reviewSchema, type ReviewInput } from "@/lib/validations/review"
import type { Review } from "@/types/review"
import { defaultGeoForCard } from "@/lib/data/recommendations"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"
import { createReviewAction, getReviewsForChazaAction } from "@/lib/actions/reviews"
import { createReportAction } from "@/lib/actions/reports"
import { getChazaProductsBySlugAction } from "@/lib/actions/chaza-products"
import { isUuid } from "@/lib/utils"
import { toast } from "sonner"

export function ChazaDetailClient({ slug }: { slug: string }) {
  const { cards } = useChazaCatalog()
  const { isLoggedIn, user } = useSession()
  const { likedIds, savedIds, addLike, toggleSave } = useFavorites()
  const useRemote = Boolean(getSupabaseBrowserEnv())
  const chaza = useMemo(() => cards.find((c) => c.slug === slug), [cards, slug])

  const [dbReviews, setDbReviews] = useState<Review[]>([])
  const [storedReviews, setStoredReviews] = useState<Review[]>([])
  const [reportOpen, setReportOpen] = useState(false)
  const [reportTarget, setReportTarget] = useState<{ type: "chaza" | "review"; id: string } | null>(null)
  const [reportReason, setReportReason] = useState("")
  const [reportDetails, setReportDetails] = useState("")
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [menuProducts, setMenuProducts] = useState<{ name: string; priceLabel: string }[]>([])
  const [authPrompt, setAuthPrompt] = useState<AuthPromptReason | null>(null)

  useEffect(() => {
    if (!useRemote) return
    void getChazaProductsBySlugAction(slug).then((r) => {
      if (r.ok) setMenuProducts(r.products)
    })
  }, [useRemote, slug])

  const reloadLocalReviews = useCallback(() => {
    if (!chaza || useRemote) return
    setStoredReviews(getStoredReviewsForChaza(chaza.id))
  }, [chaza, useRemote])

  useEffect(() => {
    if (!chaza) return
    if (useRemote) {
      void getReviewsForChazaAction(chaza.id).then(setDbReviews)
    } else {
      reloadLocalReviews()
    }
  }, [chaza, useRemote, reloadLocalReviews])

  useEffect(() => {
    if (useRemote) return
    const fn = () => reloadLocalReviews()
    window.addEventListener("chazasun-reviews", fn)
    return () => window.removeEventListener("chazasun-reviews", fn)
  }, [reloadLocalReviews, useRemote])

  const seedReviews = useMemo(() => (chaza ? getSeedReviewsForChazaCard(chaza) : []), [chaza])

  const allReviews = useMemo(() => {
    const merged = useRemote ? [...dbReviews, ...seedReviews] : [...storedReviews, ...seedReviews]
    const byId = new Map<string, Review>()
    for (const r of merged) byId.set(r.id, r)
    return [...byId.values()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [seedReviews, storedReviews, dbReviews, useRemote])

  const avg = useMemo(() => {
    if (!allReviews.length) return null
    const sum = allReviews.reduce((s, r) => s + r.rating, 0)
    return Math.round((sum / allReviews.length) * 10) / 10
  }, [allReviews])

  const form = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { chazaId: "", rating: 5, body: "" },
  })

  useEffect(() => {
    if (chaza) form.setValue("chazaId", chaza.id)
  }, [chaza, form])

  const openReport = (type: "chaza" | "review", id: string) => {
    setReportTarget({ type, id })
    setReportReason("")
    setReportDetails("")
    setReportOpen(true)
  }

  const submitReport = async () => {
    if (!reportTarget || !isLoggedIn) return
    if (reportReason.trim().length < 3) {
      toast.error("Indica un motivo (minimo 3 caracteres).")
      return
    }
    setReportSubmitting(true)
    const res = await createReportAction({
      targetType: reportTarget.type,
      targetId: reportTarget.id,
      reason: reportReason.trim(),
      details: reportDetails.trim() || undefined,
    })
    setReportSubmitting(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    toast.success("Gracias. Revisaremos tu reporte.")
    setReportOpen(false)
  }

  const onSubmitReview = form.handleSubmit(async (data) => {
    if (!chaza || !user) return
    if (useRemote) {
      const res = await createReviewAction(data, chaza.slug)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      if (res.profanityAdjusted) {
        toast.message("Ajustamos algunas palabras en tu reseña antes de publicarla.")
      }
      const next = await getReviewsForChazaAction(chaza.id)
      setDbReviews(next)
      form.reset({ chazaId: chaza.id, rating: 5, body: "" })
      toast.success("Reseña publicada.")
      return
    }
    const prof = checkProfanity(data.body)
    const body = prof.filtered
    if (!prof.ok) {
      toast.message("Ajustamos algunas palabras en tu reseña antes de publicarla.")
    }
    const review: Review = {
      id: `rv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      chazaId: chaza.id,
      authorId: user.id,
      authorDisplayName: user.displayName,
      rating: data.rating,
      body,
      status: "published",
      createdAt: new Date().toISOString(),
    }
    appendReview(review)
    reloadLocalReviews()
    form.reset({ chazaId: chaza.id, rating: 5, body: "" })
    toast.success("Reseña publicada en este navegador.")
  })

  if (!chaza) {
    return (
      <PageContainer>
        <p className="mb-6 text-gray-600">
          No encontramos esta chaza. Vuelve a explorar o ejecuta el seed si usas Supabase.
        </p>
        <Link href="/explorar" className="font-semibold text-brand-red hover:underline">
          Volver a explorar
        </Link>
      </PageContainer>
    )
  }

  const geo = chaza.geo ?? defaultGeoForCard()
  const displayRating = avg ?? chaza.rating
  const displayReviewCount = allReviews.length || chaza.reviews
  const isLiked = likedIds.includes(chaza.id)
  const isSaved = savedIds.includes(chaza.id)
  const waHref = chaza.contactWhatsApp ? `https://wa.me/${chaza.contactWhatsApp.replace(/\D/g, "")}` : null
  const igHref = chaza.contactInstagram ? `https://instagram.com/${chaza.contactInstagram.replace(/^@/, "")}` : null
  const contactHref = waHref ?? igHref

  const handleLike = async () => {
    if (!isLoggedIn) {
      setAuthPrompt("like")
      return
    }
    await addLike(chaza.id)
    toast.success("Sumado a tus gustos.")
  }

  const handleSave = async () => {
    if (!isLoggedIn) {
      setAuthPrompt("save")
      return
    }
    await toggleSave(chaza.id)
    toast.success(isSaved ? "Quitada de guardadas." : "Guardada para volver luego.")
  }

  return (
    <>
      <PageContainer className="!pt-4 sm:!pt-8">
        <Link
          href="/explorar"
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm hover:border-brand-red/30 hover:text-brand-red"
        >
          <ArrowLeft className="h-4 w-4" />
          Explorar
        </Link>

        <section className="relative overflow-hidden rounded-[2rem] bg-[#111] text-white shadow-2xl shadow-black/20">
          <div className="absolute inset-0">
            <img src={chaza.image} alt={chaza.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(163,30,30,0.45),transparent_30%)]" />
          </div>

          <div className="relative z-10 grid min-h-[620px] gap-8 p-5 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
            <div className="flex flex-col justify-end">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand-red px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                  {chaza.category}
                </span>
                {chaza.verifiedAt ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur">
                    <ShieldCheck className="h-3.5 w-3.5 text-brand-red" />
                    Verificada
                  </span>
                ) : null}
              </div>

              <h1 className="max-w-3xl font-display text-[clamp(3.5rem,10vw,7.5rem)] font-black leading-[0.86] tracking-tight">
                {chaza.name}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
                {chaza.description}
              </p>

              <div className="mt-7 grid max-w-2xl grid-cols-2 gap-2 sm:grid-cols-4">
                <MetricPill icon={<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />} label="Rating" value={`${displayRating}`} />
                <MetricPill icon={<MessageCircle className="h-4 w-4" />} label="Reseñas" value={`${displayReviewCount}`} />
                <MetricPill icon={<Clock className="h-4 w-4" />} label="Horario" value={chaza.schedule} />
                <MetricPill icon={<MapPin className="h-4 w-4" />} label="Zona" value={chaza.location} />
              </div>
            </div>

            <aside className="self-end rounded-[1.7rem] border border-white/15 bg-white/95 p-4 text-foreground shadow-2xl backdrop-blur sm:p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Desde</p>
                  <p className="font-display text-4xl font-black text-brand-red">{chaza.price}</p>
                </div>
                <ChazaShareButton slug={slug} chazaName={chaza.name} variant="icon" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => void handleLike()}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition active:scale-[0.98] ${
                    isLiked ? "bg-brand-red text-white" : "bg-gray-100 text-foreground hover:bg-brand-red/10"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                  Me gusta
                </button>
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition active:scale-[0.98] ${
                    isSaved ? "bg-foreground text-white" : "bg-gray-100 text-foreground hover:bg-gray-200"
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                  Guardar
                </button>
              </div>

              <div className="mt-3 grid gap-2">
                {contactHref && (
                  <a
                    href={contactHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-red px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-red/20 transition hover:bg-brand-red-dark active:scale-[0.98]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Contactar ahora
                  </a>
                )}
                <a
                  href={googleMapsPlaceUrl(geo.lat, geo.lng, chaza.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-bold text-foreground transition hover:border-brand-red/30 hover:text-brand-red active:scale-[0.98]"
                >
                  <Navigation className="h-4 w-4" />
                  Abrir ruta
                </a>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {chaza.tags.slice(0, 5).map((tag) => (
                  <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                    {tag}
                  </span>
                ))}
              </div>

              {useRemote && isLoggedIn && isUuid(chaza.id) && (
                <button
                  type="button"
                  onClick={() => openReport("chaza", chaza.id)}
                  className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-brand-red"
                >
                  <Flag className="h-3.5 w-3.5" />
                  Reportar esta chaza
                </button>
              )}
            </aside>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.72fr]">
          <div className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-black text-foreground">Carta</h2>
                <p className="text-sm text-muted-foreground">Productos visibles antes de caminar.</p>
              </div>
              <PackageOpen className="h-6 w-6 text-brand-red" />
            </div>
            {menuProducts.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {menuProducts.map((p, i) => (
                  <li key={i} className="flex justify-between gap-4 py-3">
                    <span className="font-medium text-gray-800">{p.name}</span>
                    <span className="shrink-0 font-bold text-brand-red">{p.priceLabel || "Consultar"}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl bg-gray-50 px-4 py-5 text-sm text-gray-500">
                Esta chaza todavía no publicó carta completa. Usa el contacto para confirmar disponibilidad.
              </p>
            )}
          </div>

          <div className="rounded-[1.5rem] border border-gray-100 bg-[#f7f7f2] p-5 sm:p-6">
            <h2 className="font-display text-2xl font-black text-foreground">Ubicación</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{chaza.location}</p>
            <div className="relative mt-5 aspect-[4/3] overflow-hidden rounded-[1.25rem] border border-black/10 bg-white">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,#f9f9f6_0%,#e4e4da_100%)]" />
              <div className="absolute left-[14%] top-[35%] h-12 w-32 rounded-full bg-black/10" />
              <div className="absolute right-[16%] top-[22%] h-20 w-16 rounded-full bg-brand-red/10" />
              <span
                className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full bg-brand-red text-white shadow-lg shadow-brand-red/30"
                style={{
                  left: `${chaza.mapPosition?.x ?? 50}%`,
                  top: `${chaza.mapPosition?.y ?? 50}%`,
                }}
              >
                <MapPin className="h-6 w-6" />
              </span>
            </div>
            <Link
              href="/mapa"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-red"
            >
              Ver mapa campus
            </Link>
          </div>
        </section>

        <section className="mt-12 max-w-3xl">
          <h2 className="font-stencil text-2xl text-brand-red mb-2">Resenas</h2>
          {avg !== null && (
            <p className="text-sm text-gray-600 mb-6">
              Promedio mostrado: <strong>{avg}</strong> / 5 ({allReviews.length})
            </p>
          )}

          <ul className="space-y-4 mb-10">
            {allReviews.length === 0 && <p className="text-gray-500 text-sm">Aun no hay reseñas. Se la primera en opinar.</p>}
            {allReviews.map((r) => (
              <li key={r.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-semibold text-gray-800">{r.authorDisplayName}</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-sm text-amber-600">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {r.rating}/5
                    </span>
                    {useRemote && isLoggedIn && isUuid(r.id) && (
                      <button
                        type="button"
                        onClick={() => openReport("review", r.id)}
                        className="text-xs text-gray-400 hover:text-brand-red whitespace-nowrap"
                      >
                        Reportar
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{r.body}</p>
                <p className="text-xs text-gray-400 mt-2" title={new Date(r.createdAt).toLocaleDateString("es-CO")}>
                  {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true, locale: es })}
                </p>
              </li>
            ))}
          </ul>

          <div className="rounded-2xl border border-gray-200 p-6 bg-white">
            <h3 className="font-semibold text-gray-800 mb-4">Escribir reseña</h3>
            {!isLoggedIn ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <p className="text-sm text-gray-600">Inicia sesion para compartir tu opinion</p>
                <Link
                  href={`/login?next=/chazas/${slug}`}
                  className="font-stencil bg-brand-red text-white px-6 py-2.5 rounded-full text-sm hover:bg-brand-red-dark"
                >
                  INICIAR SESION
                </Link>
              </div>
            ) : (
              <form onSubmit={onSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Calificacion</label>
                  <select
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    {...form.register("rating", { valueAsNumber: true })}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} estrellas
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comentario</label>
                  <textarea
                    rows={4}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    {...form.register("body")}
                  />
                  {form.formState.errors.body && (
                    <p className="text-red-600 text-xs mt-1">{form.formState.errors.body.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  className="font-stencil bg-brand-red text-white px-6 py-2.5 rounded-full text-sm hover:bg-brand-red-dark"
                >
                  PUBLICAR RESENA
                </button>
              </form>
            )}
          </div>
        </section>
      </PageContainer>

      <div className="fixed inset-x-0 bottom-16 z-40 mx-auto px-4 md:hidden">
        <div className="mx-auto flex max-w-md gap-2 rounded-[1.35rem] border border-black/10 bg-white/95 p-2 shadow-2xl shadow-black/20 backdrop-blur">
          {contactHref ? (
            <a
              href={contactHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-red px-4 py-3 text-sm font-bold text-white"
            >
              <MessageCircle className="h-4 w-4" />
              Contactar
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => void handleSave()}
            className="flex items-center justify-center rounded-2xl bg-gray-100 px-4 py-3 text-foreground"
            aria-label={isSaved ? "Quitar de guardadas" : "Guardar chaza"}
          >
            <Bookmark className={`h-5 w-5 ${isSaved ? "fill-current text-brand-red" : ""}`} />
          </button>
        </div>
      </div>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-stencil text-brand-red">Reportar contenido</DialogTitle>
            <DialogDescription className="text-gray-600">
              {reportTarget?.type === "chaza"
                ? "Cuenta el problema con esta publicacion. Un administrador lo revisara."
                : "Cuenta el problema con esta reseña."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="block text-sm font-medium text-gray-700">Motivo</label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Ej: informacion falsa, lenguaje ofensivo..."
            />
            <label className="block text-sm font-medium text-gray-700">Detalle (opcional)</label>
            <textarea
              rows={2}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              className="text-sm text-gray-600 px-4 py-2"
              onClick={() => setReportOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={reportSubmitting}
              onClick={() => void submitReport()}
              className="font-stencil bg-brand-red text-white px-6 py-2.5 rounded-full hover:bg-brand-red-dark disabled:opacity-50"
            >
              ENVIAR
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AuthPromptDialog
        open={authPrompt !== null}
        onOpenChange={(open) => !open && setAuthPrompt(null)}
        reason={authPrompt ?? "save"}
        nextPath={`/chazas/${slug}`}
      />
    </>
  )
}

function MetricPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/12 px-3 py-3 backdrop-blur">
      <div className="mb-1 flex items-center gap-1.5 text-white/70">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-[0.14em]">{label}</span>
      </div>
      <p className="truncate text-sm font-bold text-white">{value}</p>
    </div>
  )
}

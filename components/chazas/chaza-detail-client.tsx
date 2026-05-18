"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MapPin, Star, Clock, ArrowLeft, ExternalLink, Flag } from "lucide-react"
import { ChazaShareButton } from "@/components/chazas/chaza-share-button"
import { ChazaVerifiedBadge } from "@/components/chazas/chaza-verified-badge"
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
        <p className="text-gray-600 mb-6">
          No encontramos esta chaza. Vuelve a explorar o ejecuta el seed si usas Supabase.
        </p>
        <Link href="/explorar" className="text-brand-red font-semibold hover:underline">
          Volver a explorar
        </Link>
      </PageContainer>
    )
  }

  const geo = chaza.geo ?? defaultGeoForCard()
  const displayRating = avg ?? chaza.rating
  const displayReviewCount = allReviews.length || chaza.reviews

  return (
    <PageContainer>
      <Link
        href="/explorar"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-red mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a explorar
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-xl">
          <img src={chaza.image} alt={chaza.name} className="w-full h-full object-cover" />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-block bg-brand-red/10 text-brand-red text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full">
              {chaza.category}
            </span>
            {chaza.verifiedAt ? <ChazaVerifiedBadge /> : null}
          </div>
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <h1 className="font-stencil text-4xl text-brand-red">{chaza.name}</h1>
            <ChazaShareButton slug={slug} chazaName={chaza.name} className="shrink-0" />
          </div>

          {useRemote && isLoggedIn && isUuid(chaza.id) && (
            <button
              type="button"
              onClick={() => openReport("chaza", chaza.id)}
              className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-red"
            >
              <Flag className="w-4 h-4 shrink-0" />
              Reportar esta chaza
            </button>
          )}

          <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              {displayRating} ({displayReviewCount} resenas)
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {chaza.location}
            </span>
          </div>

          <p className="text-gray-700 leading-relaxed mb-6">{chaza.description}</p>

          {menuProducts.length > 0 && (
            <div className="mb-6">
              <h2 className="font-stencil text-lg text-brand-red mb-3">Carta</h2>
              <ul className="rounded-2xl border border-gray-100 divide-y divide-gray-100 bg-gray-50/50 text-sm">
                {menuProducts.map((p, i) => (
                  <li key={i} className="flex justify-between gap-4 px-4 py-2.5">
                    <span className="text-gray-800">{p.name}</span>
                    <span className="text-gray-600 shrink-0">{p.priceLabel || "—"}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
            <Clock className="w-4 h-4" />
            {chaza.schedule}
          </div>

          <p className="font-stencil text-2xl text-brand-red mb-8">Desde {chaza.price}</p>

          <div className="flex flex-wrap gap-2 mb-8">
            {chaza.tags.map((tag) => (
              <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>

          {(chaza.contactWhatsApp || chaza.contactInstagram) && (
            <div className="mb-8 space-y-2 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto</p>
              {chaza.contactWhatsApp && (
                <a
                  href={`https://wa.me/${chaza.contactWhatsApp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-brand-red font-medium hover:underline"
                >
                  WhatsApp: {chaza.contactWhatsApp}
                </a>
              )}
              {chaza.contactInstagram && (
                <a
                  href={`https://instagram.com/${chaza.contactInstagram.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-brand-red font-medium hover:underline"
                >
                  Instagram: {chaza.contactInstagram.startsWith("@") ? chaza.contactInstagram : `@${chaza.contactInstagram}`}
                </a>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 border-t pt-6">
            <a
              href={googleMapsPlaceUrl(geo.lat, geo.lng, chaza.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 font-stencil bg-brand-red text-white px-6 py-3 rounded-full hover:bg-brand-red-dark"
            >
              <ExternalLink className="w-4 h-4" />
              GOOGLE MAPS
            </a>
            <Link
              href="/mapa"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-brand-red text-brand-red font-stencil text-sm hover:bg-brand-red/5"
            >
              VER EN MAPA CAMPUS
            </Link>
          </div>
        </div>
      </div>

      <section className="mt-16 max-w-3xl">
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
              <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleString("es-CO")}</p>
            </li>
          ))}
        </ul>

        <div className="rounded-2xl border border-gray-200 p-6 bg-white">
          <h3 className="font-semibold text-gray-800 mb-4">Escribir reseña</h3>
          {!isLoggedIn ? (
            <p className="text-sm text-gray-600 mb-4">
              <Link href="/login" className="text-brand-red font-medium hover:underline">
                Inicia sesion
              </Link>{" "}
              {useRemote ? "para dejar una reseña." : "(demo) para dejar una reseña."}
            </p>
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

    </PageContainer>
  )
}

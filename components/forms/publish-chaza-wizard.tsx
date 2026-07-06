"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useCallback, useMemo, useState } from "react"
import { publishChazaSchema, whatsappSchema, instagramSchema, type PublishChazaInput } from "@/lib/validations/chaza"
import { useSession } from "@/hooks/use-session"
import { siteConfig } from "@/config/site"
import { categories } from "@/config/categories"
import { categorySlugExists } from "@/lib/data/chaza-repository"
import { appendPublishedChaza } from "@/lib/data/local-chaza-store"
import { uniqueChazaSlug, geoFromMapPercent } from "@/lib/data/publish-helpers"
import { publishChazaAction } from "@/lib/actions/publish-chaza"
import { uploadChazaCoverAction } from "@/lib/actions/upload-cover"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"
import { PinPicker } from "@/components/map/pin-picker"
import { ProductListEditor } from "@/components/forms/product-list-editor"
import { MenuVisionPicker } from "@/components/forms/menu-vision-picker"
import { CoverUploadField } from "@/components/forms/cover-upload-field"
import { Checkbox } from "@/components/ui/checkbox"
import { CHAZA_COVER_PLACEHOLDER, hasChazaCover } from "@/lib/constants/chaza-images"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  ImageIcon,
  MapPin,
  PackageOpen,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react"
import type { ChazaCard } from "@/types/chaza"

const publishAuthNext = encodeURIComponent(siteConfig.urls.publicarChaza)

const defaultValues: PublishChazaInput = {
  name: "",
  description: "",
  coverImageUrl: "",
  categorySlugs: [],
  locationText: "",
  schedule: "",
  whatsapp: "",
  instagram: "",
  mapPosition: { x: 50, y: 50 },
  products: [],
}

const STEPS = [
  "Cuenta",
  "Tu chaza",
  "Productos",
  "Ubicación",
  "Contacto",
  "Vista previa",
] as const

const STEP_HELP = [
  "Verifica tu identidad para proteger la comunidad.",
  "Cuenta qué vendes y por qué deberían elegirte.",
  "Convierte tu carta en una experiencia fácil de escanear.",
  "Marca el punto más claro para encontrarte en el campus.",
  "Publica solo canales que puedas atender rápido.",
  "Revisa cómo te verá alguien antes de guardar.",
] as const

/** Mapea cada campo del formulario al paso del wizard donde se edita. Se usa
    para llevar al usuario al primer paso con error cuando falla la publicacion
    (el boton de publicar vive en el ultimo paso, pero el campo puede estar en otro). */
const FIELD_STEP: Partial<Record<keyof PublishChazaInput, number>> = {
  name: 1,
  description: 1,
  coverImageUrl: 1,
  categorySlugs: 1,
  locationText: 1,
  schedule: 1,
  products: 2,
  mapPosition: 3,
  whatsapp: 4,
  instagram: 4,
}

export function PublishChazaWizard({ menuVisionEnabled = false }: { menuVisionEnabled?: boolean }) {
  const router = useRouter()
  const { isLoggedIn } = useSession()
  const [step, setStep] = useState(0)
  const [coverUploading, setCoverUploading] = useState(false)
  const useSupabase = Boolean(getSupabaseBrowserEnv())

  const form = useForm<PublishChazaInput>({
    resolver: zodResolver(publishChazaSchema),
    defaultValues,
    mode: "onBlur",
  })

  const categorySlugs = form.watch("categorySlugs")
  const watched = form.watch()

  const toggleCategory = useCallback(
    (slug: string, checked: boolean) => {
      const cur = form.getValues("categorySlugs")
      const next = checked ? [...cur.filter((s) => s !== slug), slug] : cur.filter((s) => s !== slug)
      form.setValue("categorySlugs", next, { shouldValidate: true })
    },
    [form]
  )

  const onCoverFile = useCallback(
    async (file: File | null) => {
      if (!file) return
      if (!file.type.startsWith("image/")) {
        toast.error("El archivo debe ser una imagen.")
        return
      }
      const maxLocal = 1_200_000
      const maxRemote = 5 * 1024 * 1024
      if (useSupabase && isLoggedIn) {
        if (file.size > maxRemote) {
          toast.error("Imagen demasiado grande (max 5 MB).")
          return
        }
        setCoverUploading(true)
        const fd = new FormData()
        fd.append("file", file)
        const res = await uploadChazaCoverAction(fd)
        setCoverUploading(false)
        if (res.ok) {
          form.setValue("coverImageUrl", res.url, { shouldValidate: true })
          toast.success("Foto subida.")
        } else {
          toast.error(res.error)
        }
        return
      }
      if (file.size > maxLocal) {
        toast.error("Imagen muy grande para modo local (max ~1.2 MB). Usa una URL.")
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        const r = reader.result
        if (typeof r === "string") form.setValue("coverImageUrl", r, { shouldValidate: true })
      }
      reader.readAsDataURL(file)
    },
    [form, useSupabase, isLoggedIn]
  )

  const validateStep = async (s: number): Promise<boolean> => {
    if (s === 0) {
      if (!isLoggedIn) {
        toast.message(useSupabase ? "Inicia sesion o crea cuenta para publicar." : "Crea una cuenta demo para publicar.")
        return false
      }
      return true
    }
    if (s === 1) {
      return form.trigger(["name", "description", "coverImageUrl", "categorySlugs", "locationText", "schedule"])
    }
    if (s === 2) return true
    if (s === 3) return form.trigger(["mapPosition"])
    if (s === 4) return true
    if (s === 5) return form.trigger()
    return true
  }

  const nextStep = async () => {
    const ok = await validateStep(step)
    if (!ok) return
    setStep((x) => Math.min(x + 1, STEPS.length - 1))
  }

  const prevStep = () => setStep((x) => Math.max(x - 1, 0))

  const buildCard = (data: PublishChazaInput): ChazaCard => {
    const slug = uniqueChazaSlug(data.name)
    const geo = geoFromMapPercent(data.mapPosition.x, data.mapPosition.y)
    const names = data.categorySlugs
      .map((s) => categories.find((c) => c.slug === s)?.name)
      .filter(Boolean) as string[]
    const category = names[0] ?? "Chaza"
    const tags = [...names.slice(0, 3), ...data.products.map((p) => p.name).slice(0, 3)].slice(0, 6)
    const cover = hasChazaCover(data.coverImageUrl) ? data.coverImageUrl.trim() : CHAZA_COVER_PLACEHOLDER
    let price = "Consultar"
    if (data.products.length > 0) {
      const first = data.products.find((p) => p.priceLabel.trim())
      price = first?.priceLabel?.trim() || "Consultar"
    }
    const wa = data.whatsapp?.trim()
    const ig = data.instagram?.trim()
    return {
      id: `published_${Date.now()}`,
      slug,
      name: data.name.trim(),
      description: data.description.trim(),
      category,
      categorySlugs: data.categorySlugs.filter((s) => categorySlugExists(s)),
      location: data.locationText.trim(),
      rating: 0,
      reviews: 0,
      image: cover,
      tags: tags.length ? tags : ["Nuevo"],
      schedule: data.schedule.trim(),
      price,
      mapPosition: data.mapPosition,
      geo,
      contactWhatsApp: wa || undefined,
      contactInstagram: ig || undefined,
    }
  }

  const onPublish = form.handleSubmit(
    async (data) => {
      if (getSupabaseBrowserEnv()) {
        const result = await publishChazaAction(data)
        if (!result.ok) {
          toast.error(result.error)
          return
        }
        toast.success("Chaza publicada.")
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("chazasun-published"))
        }
        router.push(`/chazas/${result.slug}`)
        return
      }
      const card = buildCard(data)
      appendPublishedChaza(card)
      toast.success("Chaza publicada (solo en este navegador).")
      router.push(`/chazas/${card.slug}`)
    },
    (errors) => {
      // El boton de publicar esta en el ultimo paso, pero un campo invalido
      // puede vivir en un paso anterior. Llevamos al usuario al primer paso
      // que tiene error para que pueda ver y corregir el campo resaltado.
      const errorSteps = Object.keys(errors)
        .map((field) => FIELD_STEP[field as keyof PublishChazaInput])
        .filter((value): value is number => typeof value === "number")
      if (errorSteps.length) setStep(Math.min(...errorSteps))
      toast.error("Revisa los campos resaltados.")
    }
  )

  const previewCard = useMemo(() => {
    const parsed = publishChazaSchema.safeParse(watched)
    if (!parsed.success) return null
    try {
      return buildCard(parsed.data)
    } catch {
      return null
    }
  }, [watched])

  const progress = Math.round(((step + 1) / STEPS.length) * 100)
  const selectedCategoryNames = categorySlugs
    .map((slug) => categories.find((category) => category.slug === slug)?.name)
    .filter(Boolean) as string[]
  const coverReady = hasChazaCover(watched.coverImageUrl)
  const productsCount = watched.products.length
  // Cuenta solo canales presentes Y con formato valido, para que el checklist
  // no marque "Contacto accionable" en verde cuando el submit lo va a rechazar.
  const whatsappValid = Boolean(watched.whatsapp?.trim()) && whatsappSchema.safeParse(watched.whatsapp).success
  const instagramValid = Boolean(watched.instagram?.trim()) && instagramSchema.safeParse(watched.instagram).success
  const contactChannels = (whatsappValid ? 1 : 0) + (instagramValid ? 1 : 0)

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="space-y-7 rounded-[2rem] border border-gray-100 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
      {/* Step indicator */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Paso {step + 1} de {STEPS.length}
            </span>
            <h2 className="mt-1 font-stencil text-3xl text-gray-950 sm:text-4xl">{STEPS[step]}</h2>
            <p className="mt-1 text-sm text-gray-500">{STEP_HELP[step]}</p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-red/15 bg-brand-red/5 px-3 py-1.5 text-xs font-semibold text-brand-red">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {progress}% listo
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-brand-red transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {STEPS.map((label, index) => {
            const done = index < step
            const current = index === step
            return (
              <button
                key={label}
                type="button"
                onClick={async () => {
                  if (index <= step) {
                    setStep(index)
                    return
                  }
                  if (index === step + 1) {
                    const ok = await validateStep(step)
                    if (ok) setStep(index)
                    return
                  }
                  toast.message("Avanza paso a paso para no dejar datos importantes por fuera.")
                }}
                className={`rounded-2xl border px-2.5 py-2 text-left text-xs font-semibold transition-colors ${
                  current
                    ? "border-brand-red bg-brand-red text-white"
                    : done
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-gray-100 bg-gray-50 text-gray-400"
                }`}
              >
                <span className="mb-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-[10px] text-gray-700">
                  {done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden /> : index + 1}
                </span>
                <span className="block truncate">{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {step === 0 && (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 space-y-4">
          {isLoggedIn ? (
            <>
              <p className="text-gray-700">
                {useSupabase
                  ? "Listo: tu sesión está vinculada a Supabase. Continúa con los datos de tu chaza."
                  : "Listo: tienes sesión demo. Continúa con los datos de tu chaza."}
              </p>
              <button
                type="button"
                onClick={() => void nextStep()}
                className="font-stencil bg-brand-red text-white px-6 py-2.5 rounded-full hover:bg-brand-red-dark"
              >
                SIGUIENTE
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-700">
                {useSupabase
                  ? "Para publicar necesitas una cuenta (registro o inicio de sesión)."
                  : "Para publicar necesitas una cuenta demo (sin servidor). Regístrate o inicia sesión."}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`${siteConfig.urls.registro}?next=${publishAuthNext}`}
                  className="inline-flex font-stencil bg-brand-red text-white px-6 py-2.5 rounded-full hover:bg-brand-red-dark"
                >
                  CREAR CUENTA
                </Link>
                <Link
                  href={`${siteConfig.urls.login}?next=${publishAuthNext}`}
                  className="inline-flex font-stencil border-2 border-brand-red text-brand-red px-6 py-2.5 rounded-full hover:bg-brand-red/5"
                >
                  INICIAR SESIÓN
                </Link>
              </div>
              <p className="text-xs text-gray-500">
                ¿Solo quieres mirar?{" "}
                <Link href={siteConfig.urls.explorar} className="text-brand-red hover:underline">
                  Explorar sin cuenta
                </Link>
              </p>
            </>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la chaza</label>
            <input
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-red-600 text-xs mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              rows={4}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-red-600 text-xs mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Foto de portada</label>
            <CoverUploadField
              value={form.watch("coverImageUrl")}
              onChange={(url) => form.setValue("coverImageUrl", url, { shouldValidate: true })}
              onFile={(file) => onCoverFile(file)}
              uploading={coverUploading}
              error={form.formState.errors.coverImageUrl?.message}
            />
            {useSupabase && isLoggedIn && (
              <p className="text-xs text-gray-500 mt-2">Con cuenta: la foto se guarda en Supabase Storage (max 5 MB).</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Categorías (al menos una)</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {categories.map((c) => (
                <label key={c.slug} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <Checkbox
                    checked={categorySlugs.includes(c.slug)}
                    onCheckedChange={(v) => toggleCategory(c.slug, v === true)}
                  />
                  <span>{c.name}</span>
                </label>
              ))}
            </div>
            {form.formState.errors.categorySlugs && (
              <p className="text-red-600 text-xs mt-1">{form.formState.errors.categorySlugs.message as string}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dónde encontrarte en el campus</label>
            <input
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
              {...form.register("locationText")}
            />
            {form.formState.errors.locationText && (
              <p className="text-red-600 text-xs mt-1">{form.formState.errors.locationText.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Horario aproximado</label>
            <input
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
              placeholder="Lun-Vie 10am-4pm"
              {...form.register("schedule")}
            />
            {form.formState.errors.schedule && (
              <p className="text-red-600 text-xs mt-1">{form.formState.errors.schedule.message}</p>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <p className="text-sm text-gray-600">Agrega productos uno a uno o pega varias líneas (modo carta).</p>
          {menuVisionEnabled && (
            <MenuVisionPicker
              onApply={(p) => form.setValue("products", p, { shouldValidate: true })}
            />
          )}
          <ProductListEditor
            value={form.watch("products")}
            onChange={(p) => form.setValue("products", p, { shouldValidate: true })}
          />
        </div>
      )}

      {step === 3 && (
        <PinPicker value={form.watch("mapPosition")} onChange={(pos) => form.setValue("mapPosition", pos, { shouldValidate: true })} />
      )}

      {step === 4 && (
        <div className="space-y-4">
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            {useSupabase
              ? "WhatsApp e Instagram serán visibles públicamente en el detalle de tu chaza."
              : "WhatsApp e Instagram serán visibles públicamente en el detalle de tu chaza (modo prototipo local)."}
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (opcional)</label>
            <input
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
              placeholder="+57 3..."
              aria-invalid={Boolean(form.formState.errors.whatsapp)}
              {...form.register("whatsapp")}
            />
            {form.formState.errors.whatsapp && (
              <p className="text-red-600 text-xs mt-1">{form.formState.errors.whatsapp.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram (opcional)</label>
            <input
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
              placeholder="@tu_cuenta"
              aria-invalid={Boolean(form.formState.errors.instagram)}
              {...form.register("instagram")}
            />
            {form.formState.errors.instagram && (
              <p className="text-red-600 text-xs mt-1">{form.formState.errors.instagram.message}</p>
            )}
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-6">
          {previewCard ? (
            <div className="max-w-sm mx-auto">
              <p className="text-center text-sm text-gray-500 mb-4">Así se verá en el explorador (aprox.)</p>
              <div className="relative rounded-3xl overflow-hidden border border-gray-100 shadow-xl aspect-[4/5]">
                {hasChazaCover(watched.coverImageUrl) ? (
                  <img src={previewCard.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 flex flex-col items-center justify-center gap-2">
                    <ImageIcon className="w-10 h-10 text-gray-300" aria-hidden />
                    <span className="text-sm font-medium text-gray-400">Sin imagen</span>
                    <span className="text-xs text-gray-400 px-6 text-center">Puedes publicar sin foto; se usará una portada genérica.</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-brand-red text-white text-xs font-semibold px-3 py-1.5 rounded-full">{previewCard.category}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <h3 className="font-stencil text-2xl mb-1">{previewCard.name}</h3>
                  <p className="text-white/80 text-xs line-clamp-2">{previewCard.description}</p>
                  <p className="mt-3 font-semibold">Desde {previewCard.price}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Completa los pasos anteriores para ver la vista previa.</p>
          )}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => onPublish()}
              className="font-stencil bg-brand-red text-white px-8 py-3 rounded-full hover:bg-brand-red-dark"
            >
              PUBLICAR CHAZA
            </button>
          </div>
        </div>
      )}

      {step > 0 && (
        <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={prevStep}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-brand-red/30 hover:text-brand-red"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Atrás
          </button>
          {step < STEPS.length - 1 && (
            <button
              type="button"
              onClick={() => void nextStep()}
              className="inline-flex items-center gap-2 rounded-full bg-brand-red px-5 py-2.5 font-stencil text-sm text-white hover:bg-brand-red-dark"
            >
              SIGUIENTE
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      )}
      </section>

      {(isLoggedIn || step > 0) && (
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[1.75rem] border border-gray-100 bg-gray-950 p-5 text-white shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Vista viva</span>
            <Eye className="h-4 w-4 text-white/50" aria-hidden />
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 aspect-[4/5] bg-white/5">
            {coverReady ? (
              <img src={watched.coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-white/10 to-white/0 text-white/40">
                <ImageIcon className="h-9 w-9" aria-hidden />
                <span className="text-xs font-semibold">Sin portada</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute left-4 top-4">
              <span className="rounded-full bg-brand-red px-3 py-1.5 text-xs font-semibold">
                {selectedCategoryNames[0] ?? "Categoría"}
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h3 className="font-stencil text-2xl leading-none">{watched.name || "Nombre de tu chaza"}</h3>
              <p className="mt-2 line-clamp-2 text-xs text-white/70">
                {watched.description || "Una descripción corta ayuda a decidir más rápido."}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-white/75">
                <span>{watched.locationText || "Punto del campus"}</span>
                <span>{productsCount ? `${productsCount} productos` : "Carta pendiente"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="font-stencil text-2xl text-gray-950">Checklist</h3>
          <div className="mt-4 space-y-3">
            <PublishSignal
              icon={<Store className="h-4 w-4" aria-hidden />}
              active={Boolean(watched.name.trim() && selectedCategoryNames.length)}
              label="Identidad clara"
              detail={selectedCategoryNames.join(", ") || "Elige al menos una categoría"}
            />
            <PublishSignal
              icon={<ImageIcon className="h-4 w-4" aria-hidden />}
              active={coverReady}
              label="Portada memorable"
              detail={coverReady ? "Lista para el explorador" : "Una foto real sube la confianza"}
            />
            <PublishSignal
              icon={<PackageOpen className="h-4 w-4" aria-hidden />}
              active={productsCount > 0}
              label="Carta escaneable"
              detail={productsCount ? `${productsCount} productos cargados` : "Agrega tus más vendidos"}
            />
            <PublishSignal
              icon={<MapPin className="h-4 w-4" aria-hidden />}
              active={Boolean(watched.locationText.trim())}
              label="Ubicación entendible"
              detail={watched.locationText || "Describe el punto de referencia"}
            />
            <PublishSignal
              icon={<ShieldCheck className="h-4 w-4" aria-hidden />}
              active={contactChannels > 0}
              label="Contacto accionable"
              detail={contactChannels ? `${contactChannels} canal(es) visible(s)` : "WhatsApp o Instagram ayudan a convertir"}
            />
          </div>
        </div>
      </aside>
      )}
    </div>
  )
}

function PublishSignal({
  icon,
  active,
  label,
  detail,
}: {
  icon: React.ReactNode
  active: boolean
  label: string
  detail: string
}) {
  return (
    <div className="flex gap-3">
      <span
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          active ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"
        }`}
      >
        {active ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="truncate text-xs text-gray-500">{detail}</p>
      </div>
    </div>
  )
}

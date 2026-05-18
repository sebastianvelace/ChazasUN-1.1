"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useCallback, useMemo, useState } from "react"
import { publishChazaSchema, type PublishChazaInput } from "@/lib/validations/chaza"
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
import { Checkbox } from "@/components/ui/checkbox"
import type { ChazaCard } from "@/types/chaza"
import { cn } from "@/lib/utils"

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=700&fit=crop"

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
  "Ubicacion",
  "Contacto",
  "Vista previa",
] as const

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
    const cover = data.coverImageUrl.trim() ? data.coverImageUrl : PLACEHOLDER_IMAGE
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
    () => toast.error("Revisa los campos resaltados.")
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

  return (
    <div className="space-y-8">
      <nav aria-label="Progreso" className="flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={async () => {
              if (i <= step) {
                setStep(i)
                return
              }
              for (let s = step; s < i; s++) {
                const ok = await validateStep(s)
                if (!ok) {
                  setStep(s)
                  return
                }
              }
              setStep(i)
            }}
            className={cn(
              "text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors",
              i === step
                ? "bg-brand-red text-white border-brand-red"
                : i < step
                  ? "border-brand-red/40 text-brand-red"
                  : "border-gray-200 text-gray-400"
            )}
          >
            {i + 1}. {label}
          </button>
        ))}
      </nav>

      {step === 0 && (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 space-y-4">
          {isLoggedIn ? (
            <>
              <p className="text-gray-700">
                {useSupabase
                  ? "Listo: tu sesion esta vinculada a Supabase. Continua con los datos de tu chaza."
                  : "Listo: tienes sesion demo. Continua con los datos de tu chaza."}
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
                  ? "Para publicar necesitas una cuenta (registro o inicio de sesion)."
                  : "Para publicar necesitas una cuenta demo (sin servidor). Registrate o inicia sesion."}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={siteConfig.urls.registro}
                  className="inline-flex font-stencil bg-brand-red text-white px-6 py-2.5 rounded-full hover:bg-brand-red-dark"
                >
                  CREAR CUENTA
                </Link>
                <Link
                  href={siteConfig.urls.login}
                  className="inline-flex font-stencil border-2 border-brand-red text-brand-red px-6 py-2.5 rounded-full hover:bg-brand-red/5"
                >
                  INICIAR SESION
                </Link>
              </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Foto (URL o archivo)</label>
            <input
              type="url"
              placeholder="https://..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none mb-2"
              {...form.register("coverImageUrl")}
            />
            <input
              type="file"
              accept="image/*"
              disabled={coverUploading}
              className="text-sm text-gray-600 disabled:opacity-50"
              onChange={(e) => void onCoverFile(e.target.files?.[0] ?? null)}
            />
            {coverUploading && <p className="text-xs text-gray-500 mt-1">Subiendo foto…</p>}
            {useSupabase && isLoggedIn && (
              <p className="text-xs text-gray-500 mt-1">Con cuenta: la foto se guarda en Supabase Storage (max 5 MB).</p>
            )}
            {form.formState.errors.coverImageUrl && (
              <p className="text-red-600 text-xs mt-1">{form.formState.errors.coverImageUrl.message}</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Categorias (al menos una)</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Donde encontrarte en el campus</label>
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
          <p className="text-sm text-gray-600">Agrega productos uno a uno o pega varias lineas (modo carta).</p>
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
              ? "WhatsApp e Instagram seran visibles publicamente en el detalle de tu chaza."
              : "WhatsApp e Instagram seran visibles publicamente en el detalle de tu chaza (modo prototipo local)."}
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (opcional)</label>
            <input
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
              placeholder="+57 3..."
              {...form.register("whatsapp")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram (opcional)</label>
            <input
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
              placeholder="@tu_cuenta"
              {...form.register("instagram")}
            />
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-6">
          {previewCard ? (
            <div className="max-w-sm mx-auto">
              <p className="text-center text-sm text-gray-500 mb-4">Asi se vera en el explorador (aprox.)</p>
              <div className="relative rounded-3xl overflow-hidden border border-gray-100 shadow-xl aspect-[4/5]">
                <img src={previewCard.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
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
        <div className="flex justify-between pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={prevStep}
            className="text-sm font-semibold text-gray-600 hover:text-brand-red"
          >
            Atras
          </button>
          {step < STEPS.length - 1 && (
            <button
              type="button"
              onClick={() => void nextStep()}
              className="font-stencil bg-brand-red text-white px-6 py-2.5 rounded-full text-sm hover:bg-brand-red-dark"
            >
              SIGUIENTE
            </button>
          )}
        </div>
      )}
    </div>
  )
}

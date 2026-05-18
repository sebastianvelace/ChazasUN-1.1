"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { toast } from "sonner"
import { updateChazaSchema, type UpdateChazaInput } from "@/lib/validations/chaza"
import { PinPicker } from "@/components/map/pin-picker"
import { ProductListEditor } from "@/components/forms/product-list-editor"
import { MenuVisionPicker } from "@/components/forms/menu-vision-picker"
import { updateMyChazaAction, type ChazaEditPayload } from "@/lib/actions/my-chazas"
import { replaceChazaProductsAction, type ChazaProductRow } from "@/lib/actions/chaza-products"
import { siteConfig } from "@/config/site"

export function EditChazaForm({
  initial,
  slug,
  menuVisionEnabled = false,
}: {
  initial: ChazaEditPayload
  slug: string
  menuVisionEnabled?: boolean
}) {
  const router = useRouter()
  const [products, setProducts] = useState<ChazaProductRow[]>(() =>
    initial.products?.length ? initial.products : []
  )
  const statusNorm: UpdateChazaInput["status"] =
    initial.status === "draft" || initial.status === "published" || initial.status === "paused"
      ? initial.status
      : "published"

  const form = useForm<UpdateChazaInput>({
    resolver: zodResolver(updateChazaSchema),
    defaultValues: {
      name: initial.name,
      description: initial.description,
      locationText: initial.location_text,
      schedule: initial.schedule,
      whatsapp: initial.contact_whatsapp ?? "",
      instagram: initial.contact_instagram ?? "",
      mapPosition: initial.map_position,
      status: statusNorm,
    },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    const res = await updateMyChazaAction(slug, data)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    const pRes = await replaceChazaProductsAction(slug, products)
    if (!pRes.ok) {
      toast.error(`Ficha guardada, pero la carta fallo: ${pRes.error}`)
      return
    }
    toast.success("Cambios guardados.")
    router.push(siteConfig.urls.misChazas)
    router.refresh()
  })

  return (
    <form onSubmit={onSubmit} className="space-y-8 max-w-xl">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
        <input
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
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
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
          {...form.register("description")}
        />
        {form.formState.errors.description && (
          <p className="text-red-600 text-xs mt-1">{form.formState.errors.description.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ubicacion en campus</label>
        <input
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
          {...form.register("locationText")}
        />
        {form.formState.errors.locationText && (
          <p className="text-red-600 text-xs mt-1">{form.formState.errors.locationText.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Horario</label>
        <input
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
          {...form.register("schedule")}
        />
        {form.formState.errors.schedule && (
          <p className="text-red-600 text-xs mt-1">{form.formState.errors.schedule.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Visibilidad</label>
        <select
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
          {...form.register("status")}
        >
          <option value="published">Publicada</option>
          <option value="paused">Pausada (no visible en explorar)</option>
          <option value="draft">Borrador</option>
        </select>
      </div>
      <PinPicker
        value={form.watch("mapPosition")}
        onChange={(pos) => form.setValue("mapPosition", pos, { shouldValidate: true })}
      />
      <div>
        <h3 className="font-stencil text-lg text-brand-red mb-3">Carta / productos</h3>
        {menuVisionEnabled && (
          <MenuVisionPicker className="mb-6" onApply={(p) => setProducts(p)} />
        )}
        <ProductListEditor value={products} onChange={setProducts} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (opcional)</label>
        <input className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" {...form.register("whatsapp")} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Instagram (opcional)</label>
        <input className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" {...form.register("instagram")} />
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="font-stencil bg-brand-red text-white px-8 py-3 rounded-full hover:bg-brand-red-dark"
        >
          GUARDAR
        </button>
        <Link
          href={siteConfig.urls.misChazas}
          className="inline-flex items-center justify-center font-stencil border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-full hover:bg-gray-50"
        >
          CANCELAR
        </Link>
      </div>
    </form>
  )
}

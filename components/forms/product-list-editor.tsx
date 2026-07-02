"use client"

import { useState } from "react"
import { toast } from "sonner"
import { parseCartaBulk } from "@/lib/utils/parse-carta-bulk"
import type { ChazaProductRow } from "@/lib/actions/chaza-products"

export function ProductListEditor({
  value,
  onChange,
  disabled,
}: {
  value: ChazaProductRow[]
  onChange: (next: ChazaProductRow[]) => void
  disabled?: boolean
}) {
  const [bulk, setBulk] = useState("")

  const update = (i: number, field: keyof ChazaProductRow, v: string) => {
    const next = [...value]
    next[i] = { ...next[i], [field]: v }
    onChange(next)
  }

  const remove = (i: number) => {
    onChange(value.filter((_, j) => j !== i))
  }

  const applyBulk = () => {
    const parsed = parseCartaBulk(bulk)
    if (!parsed.length) {
      toast.message("Pega o escribe lineas con nombre y precio.")
      return
    }
    onChange([...value, ...parsed])
    setBulk("")
    toast.success(`${parsed.length} productos agregados`)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange([...value, { name: "", priceLabel: "" }])}
          className="font-stencil border-2 border-brand-red text-brand-red px-4 py-2 rounded-full text-sm hover:bg-brand-red/5 disabled:opacity-50"
        >
          + PRODUCTO
        </button>
      </div>
      <div className="space-y-2">
        {value.map((row, i) => (
          <div key={i} className="flex flex-col sm:flex-row gap-2 items-start">
            <input
              className="flex-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm disabled:opacity-50"
              placeholder="Nombre"
              disabled={disabled}
              value={row.name}
              onChange={(e) => update(i, "name", e.target.value)}
            />
            <input
              className="w-full sm:w-36 rounded-xl border border-gray-200 px-3 py-2 text-sm disabled:opacity-50"
              placeholder="Precio"
              disabled={disabled}
              value={row.priceLabel}
              onChange={(e) => update(i, "priceLabel", e.target.value)}
            />
            <button
              type="button"
              disabled={disabled}
              className="text-xs text-gray-400 hover:text-red-500 px-2 disabled:opacity-50"
              onClick={() => remove(i)}
            >
              Quitar
            </button>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-dashed border-gray-200 p-4 bg-gray-50">
        <p className="text-sm font-medium text-gray-700 mb-2">Pegar carta (una linea por producto)</p>
        <p className="text-xs text-gray-500 mb-2">Ejemplo: Empanada de pollo, $2.000</p>
        <textarea
          rows={4}
          disabled={disabled}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm mb-2 disabled:opacity-50"
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={applyBulk}
          className="text-sm font-semibold text-brand-red hover:underline disabled:opacity-50"
        >
          Insertar lineas como productos
        </button>
      </div>
    </div>
  )
}

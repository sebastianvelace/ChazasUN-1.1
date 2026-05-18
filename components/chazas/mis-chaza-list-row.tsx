"use client"

import Link from "next/link"
import type { MyChazaRow } from "@/lib/actions/my-chazas"
import { ChazaShareButton } from "./chaza-share-button"

export function MisChazaListRow({ chaza }: { chaza: MyChazaRow }) {
  return (
    <li className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm flex gap-4">
      <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        {chaza.cover_image_url ? (
          <img src={chaza.cover_image_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Sin foto</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-stencil text-lg text-brand-red truncate">{chaza.name}</p>
        <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">{chaza.status}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <Link
            href={`/mis-chazas/${chaza.slug}/editar`}
            className="text-sm font-semibold text-brand-red hover:underline"
          >
            Editar
          </Link>
          <Link href={`/chazas/${chaza.slug}`} className="text-sm text-gray-600 hover:text-brand-red">
            Ver detalle
          </Link>
          <ChazaShareButton slug={chaza.slug} chazaName={chaza.name} variant="compact" />
        </div>
      </div>
    </li>
  )
}

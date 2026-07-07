import { describe, it, expect } from "vitest"
import { whatsappSchema, instagramSchema, publishChazaSchema } from "@/lib/validations/chaza"

describe("whatsappSchema", () => {
  it("acepta vacío / undefined (el canal es opcional)", () => {
    expect(whatsappSchema.safeParse("").success).toBe(true)
    expect(whatsappSchema.safeParse(undefined).success).toBe(true)
  })

  it("acepta un número válido con + opcional", () => {
    expect(whatsappSchema.safeParse("3001234567").success).toBe(true)
    expect(whatsappSchema.safeParse("+573001234567").success).toBe(true)
  })

  // Regresión: este era el bug de UX que hizo fallar el submit del wizard.
  it("RECHAZA números con espacios", () => {
    expect(whatsappSchema.safeParse("+57 300 123").success).toBe(false)
    expect(whatsappSchema.safeParse("+57 3001234567").success).toBe(false)
  })

  it("rechaza demasiado corto o demasiado largo", () => {
    expect(whatsappSchema.safeParse("123").success).toBe(false)
    expect(whatsappSchema.safeParse("1234567890123456").success).toBe(false)
  })

  it("rechaza letras", () => {
    expect(whatsappSchema.safeParse("300abc4567").success).toBe(false)
  })
})

describe("instagramSchema", () => {
  it("acepta un usuario válido con @ opcional", () => {
    expect(instagramSchema.safeParse("mi_chaza").success).toBe(true)
    expect(instagramSchema.safeParse("@mi.chaza").success).toBe(true)
  })

  it("rechaza URLs y barras", () => {
    expect(instagramSchema.safeParse("https://instagram.com/x").success).toBe(false)
    expect(instagramSchema.safeParse("insta/gram").success).toBe(false)
  })
})

describe("publishChazaSchema", () => {
  const valid = {
    name: "Don Empanada",
    description: "Empanadas recién hechas todos los días en el campus.",
    coverImageUrl: "",
    categorySlugs: ["comida"],
    locationText: "Plaza Central",
    schedule: "Lun-Vie 8am",
    whatsapp: "3001234567",
    instagram: "",
    mapPosition: { x: 40, y: 60 },
    products: [],
  }

  it("acepta un payload completo válido", () => {
    expect(publishChazaSchema.safeParse(valid).success).toBe(true)
  })

  it("rechaza nombre demasiado corto", () => {
    expect(publishChazaSchema.safeParse({ ...valid, name: "a" }).success).toBe(false)
  })

  it("rechaza descripción con menos de 20 caracteres", () => {
    expect(publishChazaSchema.safeParse({ ...valid, description: "corta" }).success).toBe(false)
  })

  it("rechaza cuando no hay ninguna categoría", () => {
    expect(publishChazaSchema.safeParse({ ...valid, categorySlugs: [] }).success).toBe(false)
  })

  it("rechaza una posición de mapa fuera de rango [0,100]", () => {
    expect(publishChazaSchema.safeParse({ ...valid, mapPosition: { x: 120, y: 60 } }).success).toBe(false)
  })
})

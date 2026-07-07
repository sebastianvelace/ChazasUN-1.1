import { describe, it, expect } from "vitest"
import { slugify } from "@/lib/utils/slugify"

describe("slugify", () => {
  it("pasa a minúsculas y reemplaza espacios por guiones", () => {
    expect(slugify("Don Empanada")).toBe("don-empanada")
  })

  it("quita tildes y la ñ (normaliza acentos)", () => {
    expect(slugify("Librería El Saber")).toBe("libreria-el-saber")
    expect(slugify("Reparación Ñoño")).toBe("reparacion-nono")
  })

  it("colapsa símbolos y recorta los guiones de los bordes", () => {
    expect(slugify("  ¡Café & Té!  ")).toBe("cafe-te")
  })

  it("limita el resultado a 80 caracteres", () => {
    expect(slugify("a".repeat(200))).toHaveLength(80)
  })
})

import { describe, it, expect } from "vitest"
import { geoFromMapPercent } from "@/lib/data/publish-helpers"

describe("geoFromMapPercent", () => {
  it("es determinista para la misma entrada", () => {
    expect(geoFromMapPercent(50, 50)).toEqual(geoFromMapPercent(50, 50))
  })

  it("y mayor mueve la latitud hacia arriba", () => {
    const center = geoFromMapPercent(50, 50)
    expect(geoFromMapPercent(50, 80).lat).toBeGreaterThan(center.lat)
  })

  it("x mayor mueve la longitud hacia el este", () => {
    const center = geoFromMapPercent(50, 50)
    expect(geoFromMapPercent(80, 50).lng).toBeGreaterThan(center.lng)
  })
})

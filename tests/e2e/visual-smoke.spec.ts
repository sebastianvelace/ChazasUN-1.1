import { expect, test } from "@playwright/test"

const pages = [
  { path: "/", marker: /CHAZAS UN|Chazas UN/i },
  { path: "/explorar", marker: /Explorar|chazas/i },
  { path: "/chazas/el-rincon-del-tinto", marker: /Contactar|Carta|Ubicacion|No encontramos/i },
  { path: "/publicar-chaza", marker: /Vista viva|Checklist|CREAR CUENTA|SIGUIENTE/i },
]

test.describe("experiencia visual critica", () => {
  for (const target of pages) {
    test(`${target.path} renderiza y soporta scroll`, async ({ page }, testInfo) => {
      const pageErrors: string[] = []
      page.on("pageerror", (error) => pageErrors.push(error.message))

      await page.goto(target.path)
      await expect(page.locator("body")).toBeVisible()
      await expect(page.locator("body")).toContainText(target.marker)

      await page.mouse.wheel(0, 900)
      await page.waitForTimeout(250)
      await page.mouse.wheel(0, 900)
      await page.waitForTimeout(250)

      await page.screenshot({
        path: testInfo.outputPath(`${target.path.replace(/\W+/g, "-") || "home"}.png`),
        fullPage: true,
      })

      expect(pageErrors).toEqual([])
    })
  }
})

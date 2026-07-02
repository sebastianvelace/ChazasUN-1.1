import { expect, test } from "@playwright/test"

const pages = [
  { path: "/", marker: /CHAZAS UN|Chazas UN/i },
  { path: "/explorar", marker: /Explorar|chazas/i },
  { path: "/chazas/el-rincon-del-tinto", marker: /Contactar|Carta|Ubicación|No encontramos/i },
  { path: "/mapa", marker: /Mapa de chazas|Plano UN Bogotá/i },
  { path: "/guardadas", marker: /Chazas guardadas|Inicia sesión/i },
  { path: "/login", marker: /Entrar|Continuar con Google/i },
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

test.describe("interacciones principales", () => {
  test("el swiper avanza y solicita cuenta para indicar interés", async ({ page }) => {
    await page.goto("/explorar")

    const understood = page.getByRole("button", { name: "Entendido" })
    if (await understood.isVisible()) await understood.click()

    const currentName = page.locator("main h3").first()
    await expect(currentName).toBeVisible()
    const before = await currentName.innerText()

    await page.getByRole("button", { name: "Pasar", exact: true }).click()
    await expect(currentName).not.toHaveText(before)

    await page.getByRole("button", { name: "Me interesa", exact: true }).click()
    await expect(page.getByRole("dialog")).toContainText(/Crea tu cuenta/i)
    await expect(page.getByRole("link", { name: "CREAR CUENTA" })).toBeVisible()
  })

  test("el mapa permite acercar, restablecer y seleccionar un punto", async ({ page }) => {
    await page.goto("/mapa")

    await page.getByRole("button", { name: "Acercar" }).click()
    await expect(page.getByRole("button", { name: "Restablecer mapa" })).toBeVisible()
    await page.getByRole("button", { name: "Restablecer mapa" }).click()
    await expect(page.getByRole("button", { name: "Restablecer mapa" })).toBeHidden()

    const firstPin = page.getByRole("button", { name: /^Chaza / }).first()
    await expect(firstPin).toBeVisible()
    await firstPin.click()
    await expect(page.locator("aside")).toContainText("VER CHAZA")
  })

  test("el formulario de acceso muestra validación contextual", async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("button", { name: "ENTRAR", exact: true }).click()
    await expect(page.getByText("Correo inválido")).toBeVisible()
    await expect(page.getByText("Ingresa tu contraseña")).toBeVisible()
  })

  test("el menú móvil abre y navega", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Comportamiento exclusivo de móvil")

    await page.goto("/explorar")
    await page.getByRole("button", { name: "Abrir menu" }).click()
    const mobileNavigation = page.locator("header")
    await expect(mobileNavigation.getByRole("link", { name: "Mapa", exact: true })).toBeVisible()
    await mobileNavigation.getByRole("link", { name: "Mapa", exact: true }).click()
    await expect(page).toHaveURL(/\/mapa$/)
  })
})

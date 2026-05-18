/** Parsea lineas tipo carta (nombre — precio) en filas de producto. */
export function parseCartaBulk(text: string): { name: string; priceLabel: string }[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
  const parsed: { name: string; priceLabel: string }[] = []
  for (const line of lines) {
    const m = line.match(/^(.+?)[\s\-–|:]+(.+)$/)
    if (m) {
      parsed.push({ name: m[1].trim(), priceLabel: m[2].trim() })
    } else {
      parsed.push({ name: line, priceLabel: "" })
    }
  }
  return parsed
}

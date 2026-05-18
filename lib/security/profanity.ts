/**
 * Filtro básico de palabras ofensivas (español).
 * Ampliar lista en producción; en backend validar de nuevo con la misma lógica.
 */
const OFFENSIVE_TERMS: string[] = [
  // Placeholder — ampliar con lista curada; mantener en servidor también
  "idiota",
  "estupido",
  "imbecil",
  "marica",
  "gonorrea",
  "hpta",
  "hp ",
  "mierda",
  "puta",
  "puto",
]

const normalizedPattern = OFFENSIVE_TERMS.map((w) =>
  w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
).join("|")

const profanityRegex = new RegExp(`\\b(${normalizedPattern})\\b`, "gi")

export function containsProfanity(text: string): boolean {
  if (!text.trim()) return false
  return profanityRegex.test(text.normalize("NFD").replace(/\p{M}/gu, ""))
}

export function filterProfanity(text: string): string {
  return text.replace(profanityRegex, (match) => "*".repeat(match.length))
}

export interface ProfanityCheckResult {
  ok: boolean
  filtered: string
}

export function checkProfanity(text: string): ProfanityCheckResult {
  const has = containsProfanity(text)
  return {
    ok: !has,
    filtered: has ? filterProfanity(text) : text,
  }
}

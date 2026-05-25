/** MIME types allowed by the chaza-covers bucket (see storage migration). */
export const ALLOWED_COVER_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const

export type AllowedCoverMimeType = (typeof ALLOWED_COVER_MIME_TYPES)[number]

const ALLOWED_SET = new Set<string>(ALLOWED_COVER_MIME_TYPES)

function matchesSignature(buffer: Buffer, sig: number[]): boolean {
  if (buffer.length < sig.length) return false
  return sig.every((b, i) => buffer[i] === b)
}

/** Detect image MIME from file magic bytes; null if unknown or unsupported. */
export function detectImageMimeFromBuffer(buffer: Buffer): AllowedCoverMimeType | null {
  if (matchesSignature(buffer, [0xff, 0xd8, 0xff])) return "image/jpeg"
  if (matchesSignature(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png"
  if (
    matchesSignature(buffer, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
    matchesSignature(buffer, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
  ) {
    return "image/gif"
  }
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp"
  }
  return null
}

export function isAllowedCoverMimeType(type: string): type is AllowedCoverMimeType {
  return ALLOWED_SET.has(type)
}

/** Normalize jpg/jpeg aliases for comparison. */
export function normalizeCoverMimeType(mime: string): string {
  return mime === "image/jpg" ? "image/jpeg" : mime
}

/** Neutral campus food-stall cover when none is uploaded. */
export const CHAZA_COVER_PLACEHOLDER =
  "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&h=700&fit=crop"

export function hasChazaCover(url: string | undefined | null): boolean {
  return Boolean(url?.trim())
}

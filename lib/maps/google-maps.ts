import { campusConfig } from "@/config/campus"

/** Abre Google Maps en el navegador (sin API key). */
export function googleMapsCampusUrl(): string {
  const { lat, lng } = campusConfig.center
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}

export function googleMapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

export function googleMapsPlaceUrl(lat: number, lng: number, label?: string): string {
  const q = label ? encodeURIComponent(label) : `${lat},${lng}`
  return `https://www.google.com/maps/search/?api=1&query=${q}`
}

export function hasGoogleMapsApiKey(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim())
}

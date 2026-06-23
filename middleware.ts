import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

function applySecurityHeaders(response: Awaited<ReturnType<typeof updateSession>>) {
  const isDev = process.env.NODE_ENV === "development"
  const scriptSrc = isDev ? "'self' 'unsafe-inline' 'unsafe-eval'" : "'self' 'unsafe-inline'"
  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https: wss:",
    "media-src 'self' data: blob: https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ")

  response.headers.set("Content-Security-Policy", csp)
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self), payment=()")
  return response
}

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  return applySecurityHeaders(response)
}

export const config = {
  matcher: [
    /*
     * Excluye assets estaticos; el resto pasa por refresh de sesion.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

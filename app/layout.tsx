import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Barlow_Condensed, Cormorant_Garamond } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { AnalyticsProvider } from '@/components/analytics/analytics-provider'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800']
})

const barlowCondensed = Barlow_Condensed({
  weight: ['600', '700', '800'],
  subsets: ["latin"],
  variable: '--font-stencil'
})

const cormorantGaramond = Cormorant_Garamond({
  weight: ['300', '400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-hero',
})

export const metadata: Metadata = {
  title: 'CHAZAS UN - Marketplace Universitario',
  description: 'El marketplace de los estudiantes de la Universidad Nacional. Compra, vende e intercambia con tu comunidad universitaria.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${plusJakartaSans.variable} ${barlowCondensed.variable} ${cormorantGaramond.variable}`}>
      <body className="font-sans antialiased bg-white">
        <AnalyticsProvider>{children}</AnalyticsProvider>
        <Toaster richColors position="top-center" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

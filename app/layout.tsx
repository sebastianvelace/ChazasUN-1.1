import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Barlow_Condensed, DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { AnalyticsProvider } from '@/components/analytics/analytics-provider'
import '@/lib/gsap'
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

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800']
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
    <html lang="es" className={`${plusJakartaSans.variable} ${barlowCondensed.variable} ${dmSans.variable}`}>
      <body className={`${plusJakartaSans.variable} ${barlowCondensed.variable} ${dmSans.variable} font-sans antialiased bg-background`}>
        <AnalyticsProvider>{children}</AnalyticsProvider>
        <Toaster richColors position="top-center" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

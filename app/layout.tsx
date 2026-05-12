import type { Metadata } from 'next'
import { Inter, Black_Ops_One } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-sans'
})

const stencil = Black_Ops_One({ 
  weight: '400',
  subsets: ["latin"],
  variable: '--font-stencil'
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
    <html lang="es" className={`${inter.variable} ${stencil.variable}`}>
      <body className="font-sans antialiased bg-brand-cream">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Sora, JetBrains_Mono } from 'next/font/google'
import { config } from '@/lib/config'
import './globals.css'

const sans = Sora({ subsets: ['latin'], variable: '--font-sora' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: config.seo.title,
  description: config.seo.description,
  generator: 'v0.app',
  icons: { icon: config.images.logo, apple: config.images.logo },
  openGraph: { title: config.seo.title, description: config.seo.description, images: [config.images.pairBanner] },
}

export const viewport: Viewport = {
  themeColor: '#d6eefd',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-dvh font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

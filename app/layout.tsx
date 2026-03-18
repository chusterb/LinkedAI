import type { Metadata, Viewport } from 'next'
import './globals.css'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.linkedai.fr'),
  title: 'LinkedAI — Posts LinkedIn dans ta vraie voix',
  description: 'Génère des posts LinkedIn en français qui sonnent comme toi, pas comme un robot. IA entraînée sur ton style, résultats en moins de 5 secondes.',
  openGraph: {
    title: 'LinkedAI — Posts LinkedIn dans ta vraie voix',
    description: 'Génère des posts LinkedIn qui sonnent exactement comme toi — pas du contenu générique, ta vraie voix.',
    type: 'website',
    locale: 'fr_FR',
    url: 'https://www.linkedai.fr',
    siteName: 'LinkedAI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LinkedAI — Posts LinkedIn dans ta vraie voix',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LinkedAI — Posts LinkedIn dans ta vraie voix',
    description: 'Génère des posts LinkedIn en français qui sonnent comme toi, pas comme un robot.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://www.linkedai.fr',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body><Providers>{children}</Providers></body>
    </html>
  )
}

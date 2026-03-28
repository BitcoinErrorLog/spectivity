import type { Metadata } from 'next'
import './globals.css'
import { Nav } from '@/components/Nav'
import { SessionProvider } from '@/components/SessionProvider'
import { AuthProvider } from '@/lib/AuthContext'

export const metadata: Metadata = {
  title: {
    default: 'Spectivity — Every spec. Every opinion. Your trust.',
    template: '%s | Spectivity',
  },
  description: 'The protocol specs registry with structured review and trust filtering. BIPs, NIPs, BOLTs, BEPs — read specs, see who reviewed them, choose whose judgment you trust.',
  metadataBase: new URL('https://spectivity.io'),
  openGraph: {
    siteName: 'Spectivity',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Spectivity' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SessionProvider>
        <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Nav />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border py-10 text-center text-text-tertiary text-sm">
            <div className="max-w-6xl mx-auto px-6">
              Powered by{' '}
              <a href="https://pubky.org" target="_blank" rel="noopener" className="text-text-secondary hover:text-text-primary transition-colors">
                Pubky Core
              </a>
              . Every spec, every opinion, your trust.
            </div>
          </footer>
        </div>
        </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  )
}

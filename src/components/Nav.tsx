'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'
import { AuthButton } from './AuthButton'

const NAV_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/bip', label: 'BIPs' },
  { path: '/nip', label: 'NIPs' },
  { path: '/bolt', label: 'BOLTs' },
  { path: '/bep', label: 'BEPs' },
  { path: '/trending', label: 'Trending' },
  { path: '/learn', label: 'Learn' },
  { path: '/faq', label: 'FAQ' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <header className="border-b border-border sticky top-0 z-50 bg-bg/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center text-white font-bold text-xs font-display">
            S
          </div>
          <span className="font-display font-semibold text-sm text-text-primary group-hover:text-accent transition-colors">
            Spectivity
          </span>
        </Link>

        <div className="flex items-center gap-3">
        <nav className="flex items-center gap-1 overflow-x-auto">
          {NAV_ITEMS.map(item => {
            const isActive = item.path === '/'
              ? pathname === '/'
              : pathname.startsWith(item.path)

            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  'px-2.5 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap',
                  isActive
                    ? 'text-text-primary bg-surface-2'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <AuthButton />
        </div>
      </div>
    </header>
  )
}

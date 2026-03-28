'use client'
import { useState, useEffect } from 'react'
import { getAuthState, simulateLogin, logout, type AuthState } from '@/lib/auth'
import { cn } from '@/lib/cn'

const DEMO_IDENTITIES = [
  { pubky: 'pk:demo-author-1', name: 'Demo Author' },
  { pubky: 'pk:demo-reviewer-1', name: 'Demo Reviewer' },
]

interface AuthBarProps {
  onAuthChange?: (state: AuthState) => void
}

export function AuthBar({ onAuthChange }: AuthBarProps) {
  const [auth, setAuth] = useState<AuthState>(getAuthState)
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    onAuthChange?.(auth)
  }, [auth, onAuthChange])

  function handleLogin(pubky: string, name: string) {
    const state = simulateLogin(pubky, name)
    setAuth(state)
    setShowPicker(false)
  }

  function handleLogout() {
    const state = logout()
    setAuth(state)
  }

  if (auth.isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-[0.6rem] font-bold text-accent">
          {auth.name?.charAt(0) ?? '?'}
        </div>
        <span className="text-xs text-text-secondary">{auth.name}</span>
        <button
          onClick={handleLogout}
          className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(p => !p)}
        className="px-3 py-1.5 bg-surface-2 border border-border rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors"
      >
        Sign in (demo)
      </button>

      {showPicker && (
        <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-xl p-2 z-50 min-w-[200px]">
          <p className="text-[0.65rem] text-text-tertiary px-2 py-1 mb-1">
            Demo identity — in production, scan with Pubky Ring
          </p>
          {DEMO_IDENTITIES.map(id => (
            <button
              key={id.pubky}
              onClick={() => handleLogin(id.pubky, id.name)}
              className="w-full text-left px-3 py-2 rounded-md text-xs text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
            >
              {id.name}
              <span className="block text-text-tertiary text-[0.6rem] font-mono">{id.pubky}</span>
            </button>
          ))}
          <div className="border-t border-border mt-1 pt-1">
            <div className="px-3 py-2 text-[0.6rem] text-text-tertiary">
              Production auth uses <code className="bg-surface-2 px-1 rounded">pubkyauth://</code> with Pubky Ring.
              Capabilities: /pub/pubky.app/posts:rw, /pub/pubky.app/tags:rw
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useAuth } from '@/lib/AuthContext'

export function AuthButton() {
  const { data: githubSession, status: githubStatus } = useSession()
  const { isAuthenticated, pubky, name, startPubkyAuth, awaitAuthApproval, cancelAuth, logout, isAuthPending } = useAuth()
  const [authUrl, setAuthUrl] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (githubStatus === 'loading') {
    return <div className="w-20 h-8 bg-surface-2 rounded-lg animate-pulse" />
  }

  if (isAuthenticated && pubky) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-[0.6rem] font-bold text-accent">
          {(name ?? pubky).charAt(0).toUpperCase()}
        </div>
        <span className="text-xs text-text-secondary truncate max-w-[120px]">{name ?? pubky.slice(0, 12)}</span>
        <button
          onClick={logout}
          className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
        >
          Sign out
        </button>
      </div>
    )
  }

  if (githubSession?.user) {
    return (
      <div className="flex items-center gap-2">
        {githubSession.user.image && (
          <img src={githubSession.user.image} alt="" className="w-6 h-6 rounded-full" />
        )}
        <span className="text-xs text-text-secondary">{githubSession.user.name}</span>
        <button
          onClick={() => signOut()}
          className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
        >
          Sign out
        </button>
      </div>
    )
  }

  if (authUrl && isAuthPending) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-xs text-text-secondary">
          <a
            href={authUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Open in Pubky Ring
          </a>
        </div>
        <button
          onClick={() => { cancelAuth(); setAuthUrl(null); setError(null) }}
          className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  async function handlePubkyAuth() {
    setError(null)
    try {
      const url = await startPubkyAuth()
      setAuthUrl(url)
      setShowMenu(false)
      await awaitAuthApproval()
      setAuthUrl(null)
    } catch (e: any) {
      if (e.message !== 'Auth flow was cancelled') {
        setError(e.message ?? 'Auth failed')
      }
      setAuthUrl(null)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(m => !m)}
        className="px-3 py-1.5 bg-surface-2 border border-border rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors"
      >
        Sign in
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-xl p-2 z-50 min-w-[220px]">
          <button
            onClick={handlePubkyAuth}
            className="w-full text-left px-3 py-2.5 rounded-md text-xs text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
          >
            <span className="font-medium">Pubky Ring</span>
            <span className="block text-text-tertiary text-[0.6rem] mt-0.5">Scan QR with Pubky Ring app</span>
          </button>
          <div className="border-t border-border my-1" />
          <button
            onClick={() => { signIn('github'); setShowMenu(false) }}
            className="w-full text-left px-3 py-2.5 rounded-md text-xs text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
          >
            <span className="font-medium">GitHub</span>
            <span className="block text-text-tertiary text-[0.6rem] mt-0.5">Sign in with your GitHub account</span>
          </button>
          {error && (
            <p className="px-3 py-1 text-[0.6rem] text-red-400">{error}</p>
          )}
        </div>
      )}
    </div>
  )
}

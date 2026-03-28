'use client'

import { useSession, signIn, signOut } from 'next-auth/react'

export function AuthButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="w-20 h-8 bg-surface-2 rounded-lg animate-pulse" />
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        {session.user.image && (
          <img src={session.user.image} alt="" className="w-6 h-6 rounded-full" />
        )}
        <span className="text-xs text-text-secondary">{session.user.name}</span>
        <button
          onClick={() => signOut()}
          className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn('github')}
      className="px-3 py-1.5 bg-surface-2 border border-border rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors"
    >
      Sign in with GitHub
    </button>
  )
}

'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { getAuthState, setAuthState, logout as doLogout, getSavedSessionExport, type AuthState } from './auth'
import { startAuthFlow, restoreSession, type Session } from './pubky'

interface AuthContextValue extends AuthState {
  session: Session | null
  startPubkyAuth: () => Promise<string>
  awaitAuthApproval: () => Promise<void>
  cancelAuth: () => void
  logout: () => void
  isAuthPending: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(getAuthState)
  const [session, setSession] = useState<Session | null>(null)
  const [isAuthPending, setIsAuthPending] = useState(false)
  const [authFlow, setAuthFlow] = useState<Awaited<ReturnType<typeof startAuthFlow>> | null>(null)

  useEffect(() => {
    const savedExport = getSavedSessionExport()
    if (savedExport && auth.isAuthenticated) {
      restoreSession(savedExport).then(s => {
        if (s) setSession(s)
      })
    }
  }, [])

  const startPubkyAuth = useCallback(async (): Promise<string> => {
    setIsAuthPending(true)
    const flow = await startAuthFlow()
    setAuthFlow(flow)
    return flow.authorizationUrl
  }, [])

  const awaitAuthApproval = useCallback(async () => {
    if (!authFlow) throw new Error('No auth flow started')
    const approvedSession = await authFlow.awaitApproval()
    const pubky = approvedSession.info?.publicKey?.toString() ?? 'unknown'
    const state = setAuthState(approvedSession, pubky)
    setSession(approvedSession)
    setAuth(state)
    setAuthFlow(null)
    setIsAuthPending(false)
  }, [authFlow])

  const cancelAuth = useCallback(() => {
    authFlow?.cancel()
    setAuthFlow(null)
    setIsAuthPending(false)
  }, [authFlow])

  const logout = useCallback(() => {
    const state = doLogout()
    setAuth(state)
    setSession(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        session,
        startPubkyAuth,
        awaitAuthApproval,
        cancelAuth,
        logout,
        isAuthPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

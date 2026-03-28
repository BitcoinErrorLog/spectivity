'use client'

import type { Session } from '@synonymdev/pubky'

export interface AuthState {
  isAuthenticated: boolean
  pubky: string | null
  name: string | null
  capabilities: string[]
  sessionExport: string | null
}

const STORAGE_KEY = 'spectivity-auth'
const SESSION_KEY = 'spectivity-session'

export function getAuthState(): AuthState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return { isAuthenticated: false, pubky: null, name: null, capabilities: [], sessionExport: null }
}

export function setAuthState(session: Session, pubky: string, name?: string): AuthState {
  const sessionExport = session.export()
  const state: AuthState = {
    isAuthenticated: true,
    pubky,
    name: name ?? pubky.slice(0, 8),
    capabilities: ['/pub/pubky.app/:rw'],
    sessionExport,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  localStorage.setItem(SESSION_KEY, sessionExport)
  return state
}

export function logout(): AuthState {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(SESSION_KEY)
  return { isAuthenticated: false, pubky: null, name: null, capabilities: [], sessionExport: null }
}

export function getSavedSessionExport(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

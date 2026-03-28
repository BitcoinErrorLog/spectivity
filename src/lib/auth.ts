/**
 * Pubky Ring authentication adapter.
 *
 * In production, this connects to a Pubky homeserver via the pubkyauth:// flow:
 * 1. App generates a client secret and subscribes to HTTP relay channel hash(secret)
 * 2. App shows pubkyauth:// QR with relay URL, required capabilities, and secret
 * 3. Pubky Ring (authenticator) signs an AuthToken with scoped capabilities
 * 4. App decrypts token, presents to homeserver, receives session
 *
 * Capabilities needed for this app:
 *   /pub/pubky.app/posts:rw    — publish specs (PubkyAppPost)
 *   /pub/pubky.app/tags:rw     — publish reviews (PubkyAppTag)
 *   /pub/pubky.app/profile:r   — read own profile
 *
 * For the demo stage, auth is simulated with a local identity selector.
 */

export interface AuthState {
  isAuthenticated: boolean
  pubky: string | null
  name: string | null
  capabilities: string[]
}

const STORAGE_KEY = 'pubky-specs-auth'

export function getAuthState(): AuthState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return { isAuthenticated: false, pubky: null, name: null, capabilities: [] }
}

export function simulateLogin(pubky: string, name: string): AuthState {
  const state: AuthState = {
    isAuthenticated: true,
    pubky,
    name,
    capabilities: [
      '/pub/pubky.app/posts:rw',
      '/pub/pubky.app/tags:rw',
      '/pub/pubky.app/profile:r',
    ],
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  return state
}

export function logout(): AuthState {
  localStorage.removeItem(STORAGE_KEY)
  return { isAuthenticated: false, pubky: null, name: null, capabilities: [] }
}

/**
 * Generate the pubkyauth:// URI that Pubky Ring would scan.
 * This is a placeholder showing the correct format.
 */
export function generateAuthUri(relayUrl: string, clientSecret: string): string {
  const capabilities = encodeURIComponent('/pub/pubky.app/posts:rw,/pub/pubky.app/tags:rw')
  return `pubkyauth://?relay=${encodeURIComponent(relayUrl)}&capabilities=${capabilities}&secret=${clientSecret}`
}

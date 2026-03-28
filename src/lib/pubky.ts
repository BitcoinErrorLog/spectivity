'use client'

import type { Session, AuthFlow } from '@synonymdev/pubky'

const HTTP_RELAY = process.env.NEXT_PUBLIC_DEFAULT_HTTP_RELAY || undefined

let pubkySdk: any = null

async function getSdk() {
  if (pubkySdk) return pubkySdk
  const { Pubky } = await import('@synonymdev/pubky')
  const isTestnet = process.env.NEXT_PUBLIC_TESTNET === 'true'
  pubkySdk = isTestnet ? Pubky.testnet() : new Pubky()
  return pubkySdk
}

export interface AuthFlowResult {
  authorizationUrl: string
  awaitApproval: () => Promise<Session>
  cancel: () => void
}

export async function startAuthFlow(): Promise<AuthFlowResult> {
  const sdk = await getSdk()
  const { AuthFlowKind } = await import('@synonymdev/pubky')
  const flow: AuthFlow = sdk.startAuthFlow(
    '/pub/pubky.app/:rw' as any,
    AuthFlowKind.signin(),
    HTTP_RELAY,
  )

  let cancelled = false
  const cancel = () => { cancelled = true }
  const awaitApproval = async () => {
    const session = await flow.awaitApproval()
    if (cancelled) throw new Error('Auth flow was cancelled')
    return session
  }

  return { authorizationUrl: flow.authorizationUrl, awaitApproval, cancel }
}

export async function restoreSession(sessionExport: string): Promise<Session | null> {
  try {
    const sdk = await getSdk()
    return await sdk.restoreSession(sessionExport)
  } catch {
    return null
  }
}

export function getHomeserverPubkey(): string {
  return process.env.NEXT_PUBLIC_HOMESERVER ?? ''
}

export { type Session }

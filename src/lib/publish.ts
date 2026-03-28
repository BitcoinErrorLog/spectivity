/**
 * Publishing adapter for writing specs and reviews to Pubky homeservers.
 *
 * In production, these functions write PubkyAppPost and PubkyAppTag objects
 * to the authenticated user's homeserver via the Pubky SDK:
 *
 *   await session.storage.putJson(
 *     `/pub/pubky.app/posts/${timestampId}`,
 *     { content, kind: 'long', attachments }
 *   )
 *
 *   await session.storage.putJson(
 *     `/pub/pubky.app/tags/${blake3Hash}`,
 *     { uri: specUri, label: stance, created_at: Date.now() * 1000 }
 *   )
 *
 * For the demo stage, these log the intended write and return a mock response.
 */

import type { ReviewStance } from '@/data/types'

export interface PublishSpecInput {
  title: string
  summary: string
  body: string
  typeLabel: string
  topicTags: string[]
}

export interface PublishReviewInput {
  specUri: string
  stance: ReviewStance
}

export async function publishSpec(
  authorPubky: string,
  input: PublishSpecInput
): Promise<{ success: boolean; uri: string }> {
  const timestampId = generateTimestampId()
  const uri = `pubky://${authorPubky}/pub/pubky.app/posts/${timestampId}`

  const post = {
    content: `# ${input.title}\n\n${input.summary}\n\n${input.body}`,
    kind: 'long' as const,
    attachments: [],
  }

  console.log('[publish] Would write PubkyAppPost:', { uri, post })
  console.log('[publish] Would tag with spec-proposal:', {
    uri,
    label: 'spec-proposal',
    created_at: Date.now() * 1000,
  })

  return { success: true, uri }
}

export async function publishReview(
  reviewerPubky: string,
  input: PublishReviewInput
): Promise<{ success: boolean; tagId: string }> {
  const tagData = `${input.specUri}:${input.stance}`
  const tagId = `tag-${hashSimple(tagData)}`

  const tag = {
    uri: input.specUri,
    label: input.stance,
    created_at: Date.now() * 1000,
  }

  console.log('[publish] Would write PubkyAppTag:', { tagId, tag })

  return { success: true, tagId }
}

function generateTimestampId(): string {
  return Date.now().toString(36).toUpperCase().padStart(13, '0')
}

function hashSimple(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0
  }
  return Math.abs(hash).toString(36).padStart(8, '0')
}

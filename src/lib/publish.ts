'use client'

import type { Session, Path } from '@synonymdev/pubky'
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

export interface PublishCommentInput {
  content: string
  parentUri?: string
}

export async function publishSpec(
  session: Session,
  authorPubky: string,
  input: PublishSpecInput,
): Promise<{ success: boolean; uri: string }> {
  const timestampId = generateTimestampId()
  const path: Path = `/pub/pubky.app/posts/${timestampId}`
  const uri = `pubky://${authorPubky}${path}`

  const post = {
    content: `# ${input.title}\n\n${input.summary}\n\n${input.body}`,
    kind: 'long' as const,
    attachments: [],
  }

  await session.storage.putJson(path, post)

  const tagPath: Path = `/pub/pubky.app/tags/${hashForTag(uri + ':spec-proposal')}`
  await session.storage.putJson(tagPath, {
    uri,
    label: 'spec-proposal',
    created_at: Date.now() * 1000,
  })

  for (const tag of input.topicTags.slice(0, 5)) {
    const topicTagPath: Path = `/pub/pubky.app/tags/${hashForTag(uri + ':' + tag)}`
    await session.storage.putJson(topicTagPath, {
      uri,
      label: tag,
      created_at: Date.now() * 1000,
    })
  }

  return { success: true, uri }
}

export async function publishReview(
  session: Session,
  reviewerPubky: string,
  input: PublishReviewInput,
): Promise<{ success: boolean; tagId: string }> {
  const tagId = hashForTag(`${input.specUri}:${input.stance}`)
  const path: Path = `/pub/pubky.app/tags/${tagId}`

  await session.storage.putJson(path, {
    uri: input.specUri,
    label: input.stance,
    created_at: Date.now() * 1000,
  })

  return { success: true, tagId }
}

export async function publishComment(
  session: Session,
  authorPubky: string,
  input: PublishCommentInput,
): Promise<{ success: boolean; uri: string }> {
  const timestampId = generateTimestampId()
  const path: Path = `/pub/pubky.app/posts/${timestampId}`
  const uri = `pubky://${authorPubky}${path}`

  const post: Record<string, any> = {
    content: input.content,
    kind: 'short' as const,
    attachments: [],
  }
  if (input.parentUri) {
    post.parent = input.parentUri
  }

  await session.storage.putJson(path, post)

  const tagPath: Path = `/pub/pubky.app/tags/${hashForTag(uri + ':spec-discussion')}`
  await session.storage.putJson(tagPath, {
    uri,
    label: 'spec-discussion',
    created_at: Date.now() * 1000,
  })

  return { success: true, uri }
}

function generateTimestampId(): string {
  return Date.now().toString(36).toUpperCase().padStart(13, '0')
}

function hashForTag(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0
  }
  return Math.abs(hash).toString(36).padStart(8, '0')
}

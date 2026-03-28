import { searchPostsByTag, fetchPostReplies, type NexusPost } from '@/lib/nexus'

export interface Discussion {
  id: string
  specId: string
  authorPubky: string
  authorName: string
  parentId?: string
  body: string
  createdAt: string
  updatedAt: string
}

function nexusPostToDiscussion(post: NexusPost, specId: string, parentId?: string): Discussion {
  return {
    id: post.details.id,
    specId,
    authorPubky: post.details.author,
    authorName: post.details.author.slice(0, 12),
    parentId,
    body: post.details.content,
    createdAt: new Date(post.details.indexed_at * 1000).toISOString(),
    updatedAt: new Date(post.details.indexed_at * 1000).toISOString(),
  }
}

export async function fetchDiscussionsForSpec(specId: string): Promise<Discussion[]> {
  try {
    const posts = await searchPostsByTag(`spec-discussion-${specId}`, { limit: 50 })
    if (posts.length > 0) {
      return posts.map(p => nexusPostToDiscussion(p, specId))
    }
  } catch {}
  return getDiscussionsForSpec(specId)
}

export async function fetchRepliesForPost(authorId: string, postId: string, specId: string): Promise<Discussion[]> {
  try {
    const replies = await fetchPostReplies(authorId, postId)
    return replies.map(r => nexusPostToDiscussion(r, specId, postId))
  } catch {}
  return []
}

const MOCK_DISCUSSIONS: Discussion[] = [
  {
    id: 'disc-001',
    specId: 'spec-ordinal-indexing',
    authorPubky: 'pk:gh-vostrnad',
    authorName: 'vostrnad',
    body: 'Concept ACK for BIP assignment. While this proposal is controversial, not useful to most users, and argued by some to be outright malicious, these were never reasons to reject a BIP.',
    createdAt: '2023-02-16T00:50:00Z',
    updatedAt: '2023-02-16T00:50:00Z',
  },
  {
    id: 'disc-002',
    specId: 'spec-ordinal-indexing',
    authorPubky: 'pk:gh-kallewoof',
    authorName: 'kallewoof',
    body: 'BIP assignments are not endorsements, merely a way to conveniently refer to various proposals.',
    createdAt: '2023-02-17T23:23:00Z',
    updatedAt: '2023-02-17T23:23:00Z',
  },
  {
    id: 'disc-003',
    specId: 'spec-ordinal-indexing',
    authorPubky: 'pk:gh-casey',
    authorName: 'casey',
    body: 'An accepted BIP does not indicate endorsement by the BIP repo maintainers, Bitcoin Core, or the larger Bitcoin community. A BIP is more akin to a form of technical documentation or standard.',
    createdAt: '2023-02-15T08:03:00Z',
    updatedAt: '2023-02-15T08:03:00Z',
  },
  {
    id: 'disc-004',
    specId: 'spec-ordinal-indexing',
    authorPubky: 'pk:gh-michaelfolkson',
    authorName: 'michaelfolkson',
    parentId: 'disc-003',
    body: 'Whether this gets allocated a BIP number or not seems ultimately down to the BIP editors\' discretion.',
    createdAt: '2023-02-18T14:38:00Z',
    updatedAt: '2023-02-18T14:38:00Z',
  },
]

export function getDiscussionsForSpec(specId: string): Discussion[] {
  return MOCK_DISCUSSIONS.filter(d => d.specId === specId)
}

export function getTopLevelDiscussions(specId: string): Discussion[] {
  return MOCK_DISCUSSIONS.filter(d => d.specId === specId && !d.parentId)
}

export function getReplies(parentId: string): Discussion[] {
  return MOCK_DISCUSSIONS.filter(d => d.parentId === parentId)
}

export function getAllDiscussions(): Discussion[] {
  return MOCK_DISCUSSIONS
}

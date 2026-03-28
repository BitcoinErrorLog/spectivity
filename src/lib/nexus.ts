const NEXUS_URL = process.env.NEXT_PUBLIC_NEXUS_URL ?? 'https://nexus.staging.pubky.app'

function buildUrl(endpoint: string, params?: Record<string, string>): string {
  const url = new URL(`${NEXUS_URL}/v0/${endpoint}`)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v) url.searchParams.set(k, v)
    }
  }
  return url.toString()
}

async function fetchNexus<T = any>(endpoint: string, params?: Record<string, string>): Promise<T | null> {
  try {
    const res = await fetch(buildUrl(endpoint, params), {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export interface NexusPost {
  details: {
    id: string
    indexed_at: number
    author: string
    content: string
    kind: string
    uri: string
  }
  counts: {
    tags: number
    replies: number
    reposts: number
  }
  relationships?: {
    replied: boolean
    reposted: boolean
  }
}

export interface NexusTag {
  label: string
  taggers: string[]
  taggers_count: number
}

export interface NexusUser {
  details: {
    name: string
    bio: string
    image: string
    links: Array<{ title: string; url: string }>
    status: string
    pubky: string
  }
}

export async function fetchPostsByTag(tag: string, options?: { skip?: number; limit?: number }): Promise<NexusPost[]> {
  const skip = options?.skip?.toString()
  const limit = options?.limit?.toString() ?? '20'
  const result = await fetchNexus<NexusPost[]>(`stream/posts`, { tag, skip: skip ?? '0', limit })
  return result ?? []
}

export async function fetchPostReplies(authorId: string, postId: string): Promise<NexusPost[]> {
  const result = await fetchNexus<NexusPost[]>(`post/${authorId}/${postId}/replies`)
  return result ?? []
}

export async function fetchPostTags(authorId: string, postId: string): Promise<NexusTag[]> {
  const result = await fetchNexus<NexusTag[]>(`post/${authorId}/${postId}/tags`)
  return result ?? []
}

export async function fetchUserDetails(userId: string): Promise<NexusUser | null> {
  return fetchNexus<NexusUser>(`user/${userId}/details`)
}

export async function searchPostsByTag(tag: string, options?: { skip?: number; limit?: number }): Promise<NexusPost[]> {
  const skip = options?.skip?.toString()
  const limit = options?.limit?.toString() ?? '20'
  const result = await fetchNexus<NexusPost[]>(`search/posts/by_tag/${encodeURIComponent(tag)}`, {
    skip: skip ?? '0',
    limit,
  })
  return result ?? []
}

export async function fetchUserPosts(userId: string, options?: { skip?: number; limit?: number }): Promise<NexusPost[]> {
  const skip = options?.skip?.toString()
  const limit = options?.limit?.toString() ?? '20'
  const result = await fetchNexus<NexusPost[]>(`user/${userId}/posts`, { skip: skip ?? '0', limit })
  return result ?? []
}

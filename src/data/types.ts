/**
 * Types mirroring pubky-app-specs models, extended with
 * domain-specific interfaces for the specs registry.
 */

export interface PubkyAppUser {
  name: string
  bio?: string
  image?: string
  links?: { title: string; url: string }[]
  status?: string
}

export interface PubkyAppPost {
  content: string
  kind: 'short' | 'long' | 'image' | 'video' | 'link' | 'file'
  parent?: string
  embed?: { kind: string; uri: string }
  attachments?: string[]
}

export interface PubkyAppTag {
  uri: string
  label: string
  created_at: number
}

export interface PubkyAppFeed {
  feed: PubkyAppFeedConfig
  name: string
  created_at: number
}

export interface PubkyAppFeedConfig {
  tags?: string[]
  reach: 'following' | 'followers' | 'friends' | 'all'
  layout: 'columns' | 'wide' | 'visual'
  sort: 'recent' | 'popularity'
  content?: string
}

// --- Domain types for the registry ---

export type SpecSource = 'merged' | 'open-pr' | 'closed-pr' | 'rejected-pr' | 'direct'

export interface SpecNamespace {
  id: string
  label: string
  fullName: string
  description: string
  repo?: string
  color: string
}

export const NAMESPACES: SpecNamespace[] = [
  { id: 'bip', label: 'BIP', fullName: 'Bitcoin Improvement Proposals', description: 'Proposals for the Bitcoin protocol, peer-to-peer network, and client software.', repo: 'bitcoin/bips', color: '#F7931A' },
  { id: 'nip', label: 'NIP', fullName: 'Nostr Implementation Possibilities', description: 'Proposals for the Nostr protocol and relay/client ecosystem.', repo: 'nostr-protocol/nips', color: '#8B5CF6' },
  { id: 'bep', label: 'BEP', fullName: 'BitTorrent Enhancement Proposals', description: 'Proposals for the BitTorrent protocol and Mainline DHT.', repo: 'bittorrent/bittorrent.org', color: '#22D3EE' },
  { id: 'bolt', label: 'BOLT', fullName: 'Basis of Lightning Technology', description: 'Specifications for the Lightning Network protocol.', repo: 'lightning/bolts', color: '#FACC15' },
  { id: 'slip', label: 'SLIP', fullName: 'SatoshiLabs Improvement Proposals', description: 'Proposals for hardware wallet standards and key derivation.', repo: 'satoshilabs/slips', color: '#4ADE80' },
  { id: 'other', label: 'Other', fullName: 'Independent Proposals', description: 'Specs published directly without a traditional standards body.', color: '#94A3B8' },
]

export function getNamespace(id: string): SpecNamespace {
  return NAMESPACES.find(n => n.id === id) ?? NAMESPACES[NAMESPACES.length - 1]
}

export interface Spec {
  id: string
  namespace: string
  authorPubky: string
  uri: string
  title: string
  summary: string
  body: string
  typeLabel: 'specification' | 'informational' | 'process'
  topicTags: string[]
  createdAt: string
  updatedAt: string
  revisionUris: string[]
  discussionLinks: string[]
  requires?: string
  replaces?: string
  replacedBy?: string
  source: SpecSource
  sourceUrl?: string
  specNumber?: number
  prNumber?: number
  githubAuthor?: string
  status?: string
  layer?: string
}

export interface Review {
  id: string
  specId: string
  reviewerPubky: string
  label: ReviewStance
  createdAt: number
}

export type ReviewStance =
  | 'ack'
  | 'nack'
  | 'concept-ack'
  | 'needs-work'
  | 'deployment-risk'
  | 'duplicate'
  | 'editorial-issue'
  | 'superseded'

export const POSITIVE_STANCES: ReviewStance[] = ['ack', 'concept-ack']
export const NEGATIVE_STANCES: ReviewStance[] = ['nack', 'deployment-risk', 'superseded']
export const NEUTRAL_STANCES: ReviewStance[] = ['needs-work', 'duplicate', 'editorial-issue']

export interface Reviewer {
  pubky: string
  name: string
  bio: string
  image?: string
  role: string
  expertise: string[]
  links?: { title: string; url: string }[]
}

export interface Attestation {
  id: string
  specId: string
  attestorPubky: string
  attestationType: 'implemented' | 'in-progress' | 'deployed' | 'supports' | 'opposes' | 'compatible' | 'incompatible'
  subject: string
  evidenceLink: string
  statement: string
  createdAt: string
}

export interface CuratorCollection {
  id: string
  curatorPubky: string
  title: string
  description: string
  specIds: string[]
  createdAt: string
}

/**
 * How a trust preset selects its reviewers.
 *
 * 'all'         — every reviewer, no filtering
 * 'profile-tag' — reviewers whose profiles are tagged with specific labels
 *                 by users in the viewer's trust graph
 * 'named-list'  — a curator-published list of specific pubkeys
 *                 (e.g. "Current BIP Editors" or "Core Lightning maintainers")
 * 'has-reviewed' — anyone who has reviewed specs with certain topic tags
 */
export type PresetCriteria =
  | { type: 'all' }
  | { type: 'profile-tag'; tags: string[]; description: string }
  | { type: 'named-list'; curatorPubky: string; listName: string; description: string }
  | { type: 'has-reviewed'; topicTags: string[]; description: string }

export interface TrustPreset {
  id: string
  title: string
  description: string
  criteria: PresetCriteria
  includedReviewers: string[]
  excludedReviewers: string[]
}

export interface ReviewSummary {
  specId: string
  total: number
  byStance: Partial<Record<ReviewStance, number>>
  byReviewer: Record<string, ReviewStance>
  isContested: boolean
  implementations: number
}

export function stanceColor(stance: ReviewStance): string {
  if (POSITIVE_STANCES.includes(stance)) return 'text-emerald-400'
  if (NEGATIVE_STANCES.includes(stance)) return 'text-red-400'
  return 'text-amber-400'
}

export function stanceBgColor(stance: ReviewStance): string {
  if (POSITIVE_STANCES.includes(stance)) return 'bg-emerald-400/15 border-emerald-400/30 text-emerald-400'
  if (NEGATIVE_STANCES.includes(stance)) return 'bg-red-400/15 border-red-400/30 text-red-400'
  return 'bg-amber-400/15 border-amber-400/30 text-amber-400'
}

export function stanceLabel(stance: ReviewStance): string {
  return stance.replace(/-/g, ' ')
}

/**
 * Data adapter layer for Spectivity.
 *
 * Reads from synced spec data when available, falls back to mock data.
 * In production, these functions call Nexus API endpoints.
 */

import type {
  Spec,
  Review,
  Reviewer,
  Attestation,
  CuratorCollection,
  TrustPreset,
  ReviewSummary,
  ReviewStance,
  SpecNamespace,
} from './types'
import { POSITIVE_STANCES, NEGATIVE_STANCES, NAMESPACES, getNamespace } from './types'

import * as mock from './mockData'

let syncedSpecs: Spec[] | null = null
let syncedReviews: Review[] | null = null
let syncedAuthors: Record<string, { githubLogin: string; name: string; bio: string }> | null = null

try {
  syncedSpecs = require('./synced/specs.json') as Spec[]
  syncedReviews = require('./synced/reviews.json') as Review[]
  syncedAuthors = require('./synced/authors.json')
} catch {
  // synced data not available
}

const useSynced = syncedSpecs !== null && Array.isArray(syncedSpecs) && syncedSpecs.length > 0

function getSpecs(): Spec[] {
  if (useSynced) return syncedSpecs!
  return mock.specs
}

function getReviews(): Review[] {
  if (useSynced && syncedReviews) return syncedReviews
  return mock.reviews
}

export function getAllSpecs(): Spec[] {
  return getSpecs()
}

export function getSpec(id: string): Spec | undefined {
  return getSpecs().find(s => s.id === id)
}

export function getSpecByNamespaceAndNumber(namespace: string, num: number): Spec | undefined {
  return getSpecs().find(s => s.namespace === namespace && s.specNumber === num)
}

export function getSpecByNamespaceAndId(namespace: string, idSuffix: string): Spec | undefined {
  const num = parseInt(idSuffix, 10)
  if (!isNaN(num)) {
    const byNum = getSpecByNamespaceAndNumber(namespace, num)
    if (byNum) return byNum
  }
  return getSpecs().find(s => s.namespace === namespace && s.id.endsWith(idSuffix))
    ?? getSpec(`${namespace}-${idSuffix}`)
    ?? getSpec(idSuffix)
}

export function getAllReviewers(): Reviewer[] {
  if (useSynced && syncedReviews) {
    const seen = new Set<string>()
    const reviewers: Reviewer[] = []
    for (const r of syncedReviews) {
      if (seen.has(r.reviewerPubky)) continue
      seen.add(r.reviewerPubky)
      const ghUser = (r as any).githubUser
      reviewers.push({
        pubky: r.reviewerPubky,
        name: ghUser ?? r.reviewerPubky.replace('pk:gh-', ''),
        bio: 'Spec reviewer on GitHub.',
        role: 'GitHub Reviewer',
        expertise: [],
      })
    }
    for (const reviewer of mock.reviewers) {
      if (!seen.has(reviewer.pubky)) {
        reviewers.push(reviewer)
        seen.add(reviewer.pubky)
      }
    }
    return reviewers
  }
  return mock.reviewers
}

export function getReviewer(pubky: string): Reviewer | undefined {
  return getAllReviewers().find(r => r.pubky === pubky)
}

export function getReviewsForSpec(specId: string): Review[] {
  return getReviews().filter(r => r.specId === specId)
}

export function getReviewsByReviewer(pubky: string): Review[] {
  return getReviews().filter(r => r.reviewerPubky === pubky)
}

export function getAttestationsForSpec(specId: string): Attestation[] {
  return mock.attestations.filter(a => a.specId === specId)
}

export function getActiveNamespaces(): SpecNamespace[] {
  const specs = getSpecs()
  const nsIds = new Set(specs.map(s => s.namespace))
  return NAMESPACES.filter(n => nsIds.has(n.id))
}

export function getSpecsByNamespace(namespace: string): Spec[] {
  return getSpecs().filter(s => s.namespace === namespace)
}

export function getAllCollections(): CuratorCollection[] {
  const specs = getSpecs()
  const dynamicCollections: CuratorCollection[] = []
  const now = new Date().toISOString()

  const namespaces = getActiveNamespaces()
  for (const ns of namespaces) {
    const nsSpecs = specs.filter(s => s.namespace === ns.id)
    const mergedIds = nsSpecs.filter(s => s.source === 'merged').map(s => s.id)
    const rejectedIds = nsSpecs.filter(s => s.source === 'rejected-pr').map(s => s.id)
    const openIds = nsSpecs.filter(s => s.source === 'open-pr').map(s => s.id)

    if (mergedIds.length > 0) {
      dynamicCollections.push({
        id: `col-${ns.id}-merged`,
        curatorPubky: `pk:${ns.id}-mirror`,
        title: `${ns.label}s — Merged`,
        description: `${ns.fullName} accepted into the ${ns.repo ?? 'official'} repository.`,
        specIds: mergedIds,
        createdAt: now,
      })
    }
    if (rejectedIds.length > 0) {
      dynamicCollections.push({
        id: `col-${ns.id}-rejected`,
        curatorPubky: `pk:${ns.id}-mirror`,
        title: `${ns.label}s — Rejected`,
        description: `Proposals closed without acceptance by ${ns.label} editors.`,
        specIds: rejectedIds,
        createdAt: now,
      })
    }
    if (openIds.length > 0) {
      dynamicCollections.push({
        id: `col-${ns.id}-open`,
        curatorPubky: `pk:${ns.id}-mirror`,
        title: `${ns.label}s — Open`,
        description: `Proposals currently under discussion.`,
        specIds: openIds,
        createdAt: now,
      })
    }
  }

  return [...dynamicCollections, ...mock.collections]
}

export function getCollection(id: string): CuratorCollection | undefined {
  return getAllCollections().find(c => c.id === id)
}

export function getCollectionsForSpec(specId: string): CuratorCollection[] {
  return getAllCollections().filter(c => c.specIds.includes(specId))
}

export function getAllTrustPresets(): TrustPreset[] {
  if (useSynced) {
    const allReviewerPubkys = getAllReviewers().map(r => r.pubky)
    return [
      {
        id: 'preset-all',
        title: 'All Reviewers',
        description: 'Every reviewer. No filtering.',
        criteria: { type: 'all' as const },
        includedReviewers: allReviewerPubkys,
        excludedReviewers: [],
      },
      ...mock.trustPresets.filter(p => p.id !== 'preset-all'),
    ]
  }
  return mock.trustPresets
}

export function getTrustPreset(id: string): TrustPreset | undefined {
  return getAllTrustPresets().find(p => p.id === id)
}

export function getAuthor(pubky: string): { name: string; bio: string } | undefined {
  const reviewer = getAllReviewers().find(r => r.pubky === pubky)
  if (reviewer) return { name: reviewer.name, bio: reviewer.bio }

  if (syncedAuthors) {
    for (const [, info] of Object.entries(syncedAuthors)) {
      if (pubky.includes(info.githubLogin.toLowerCase())) {
        return { name: info.name, bio: info.bio }
      }
    }
  }

  return mock.authors[pubky]
}

export function buildReviewSummary(
  specId: string,
  filteredReviewerPubkys?: string[]
): ReviewSummary {
  let specReviews = getReviewsForSpec(specId)

  if (filteredReviewerPubkys && filteredReviewerPubkys.length > 0) {
    specReviews = specReviews.filter(r =>
      filteredReviewerPubkys.includes(r.reviewerPubky)
    )
  }

  const byStance: Partial<Record<ReviewStance, number>> = {}
  const byReviewer: Record<string, ReviewStance> = {}

  for (const review of specReviews) {
    byStance[review.label] = (byStance[review.label] || 0) + 1
    byReviewer[review.reviewerPubky] = review.label
  }

  const positiveCount = Object.entries(byStance)
    .filter(([k]) => POSITIVE_STANCES.includes(k as ReviewStance))
    .reduce((sum, [, v]) => sum + v, 0)

  const negativeCount = Object.entries(byStance)
    .filter(([k]) => NEGATIVE_STANCES.includes(k as ReviewStance))
    .reduce((sum, [, v]) => sum + v, 0)

  const isContested = positiveCount > 0 && negativeCount > 0

  const specAttestations = getAttestationsForSpec(specId)
  const implementations = specAttestations.filter(
    a => a.attestationType === 'implemented' || a.attestationType === 'deployed'
  ).length

  return {
    specId,
    total: specReviews.length,
    byStance,
    byReviewer,
    isContested,
    implementations,
  }
}

export function getSourceLabel(source: Spec['source'], namespace?: string): string {
  const ns = namespace ? getNamespace(namespace) : undefined
  const prefix = ns && ns.id !== 'other' ? ns.label : ''
  switch (source) {
    case 'merged': return prefix ? `Merged ${prefix}` : 'Merged'
    case 'open-pr': return 'Open PR'
    case 'closed-pr': return 'Closed PR'
    case 'rejected-pr': return 'Rejected'
    case 'direct': return 'Direct'
  }
}

export function getSourceColor(source: Spec['source']): string {
  switch (source) {
    case 'merged': return 'bg-emerald-400/15 text-emerald-400'
    case 'open-pr': return 'bg-blue-400/15 text-blue-400'
    case 'closed-pr': return 'bg-surface-3 text-text-tertiary'
    case 'rejected-pr': return 'bg-red-400/15 text-red-400'
    case 'direct': return 'bg-accent-dim text-accent'
  }
}

export function getNamespaceColor(namespace: string): string {
  return getNamespace(namespace).color
}

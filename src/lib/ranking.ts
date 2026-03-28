import type { Spec, ReviewSummary, ReviewStance } from '@/data/types'
import { POSITIVE_STANCES, NEGATIVE_STANCES } from '@/data/types'
import { buildReviewSummary, getAttestationsForSpec, getCollectionsForSpec } from '@/data/adapters'

export type SortMode = 'engagement' | 'recent' | 'implementations' | 'controversial'

export interface RankedSpec {
  spec: Spec
  summary: ReviewSummary
  score: number
  explanation: string
}

export function rankSpecs(
  specs: Spec[],
  sortMode: SortMode,
  filteredReviewerPubkys?: string[],
  selectedCollectionId?: string
): RankedSpec[] {
  let filtered = specs

  if (selectedCollectionId) {
    const col = getCollectionsForSpec
    filtered = specs.filter(s => {
      const cols = getCollectionsForSpec(s.id)
      return cols.some(c => c.id === selectedCollectionId)
    })
  }

  const ranked: RankedSpec[] = filtered.map(spec => {
    const summary = buildReviewSummary(spec.id, filteredReviewerPubkys)
    const { score, explanation } = computeScore(spec, summary, sortMode)
    return { spec, summary, score, explanation }
  })

  ranked.sort((a, b) => b.score - a.score)
  return ranked
}

function computeScore(
  spec: Spec,
  summary: ReviewSummary,
  sortMode: SortMode
): { score: number; explanation: string } {
  switch (sortMode) {
    case 'engagement': {
      const score = summary.total + summary.implementations * 2
      const parts: string[] = []
      if (summary.total > 0) parts.push(`${summary.total} reviews`)
      if (summary.implementations > 0) parts.push(`${summary.implementations} implementations`)
      return {
        score,
        explanation: parts.length > 0
          ? `Surfaced by ${parts.join(' and ')}.`
          : 'No reviews yet.',
      }
    }
    case 'recent': {
      const score = new Date(spec.updatedAt).getTime()
      return {
        score,
        explanation: `Updated ${formatDate(spec.updatedAt)}.`,
      }
    }
    case 'implementations': {
      const atts = getAttestationsForSpec(spec.id)
      const implCount = atts.filter(
        a => a.attestationType === 'implemented' || a.attestationType === 'deployed'
      ).length
      return {
        score: implCount * 100 + summary.total,
        explanation: implCount > 0
          ? `${implCount} implementation${implCount > 1 ? 's' : ''} reported.`
          : 'No implementations reported.',
      }
    }
    case 'controversial': {
      const positive = Object.entries(summary.byStance)
        .filter(([k]) => POSITIVE_STANCES.includes(k as ReviewStance))
        .reduce((s, [, v]) => s + v, 0)
      const negative = Object.entries(summary.byStance)
        .filter(([k]) => NEGATIVE_STANCES.includes(k as ReviewStance))
        .reduce((s, [, v]) => s + v, 0)
      const controversy = Math.min(positive, negative) * 2
      return {
        score: controversy + summary.total,
        explanation: summary.isContested
          ? `Contested: ${positive} positive, ${negative} negative reviews.`
          : 'Not contested.',
      }
    }
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function buildExplanation(
  summary: ReviewSummary,
  filteredReviewerPubkys?: string[],
  allReviewerCount?: number
): string {
  const parts: string[] = []

  if (filteredReviewerPubkys && allReviewerCount && filteredReviewerPubkys.length < allReviewerCount) {
    parts.push(`Showing ${filteredReviewerPubkys.length} of ${allReviewerCount} reviewers.`)
  }

  if (summary.total === 0) {
    parts.push('No reviews from selected reviewers.')
  } else {
    const stanceParts = Object.entries(summary.byStance)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => `${v} ${k.replace(/-/g, ' ')}`)
    parts.push(stanceParts.join(', ') + '.')
  }

  if (summary.implementations > 0) {
    parts.push(`${summary.implementations} implementation${summary.implementations > 1 ? 's' : ''}.`)
  }

  return parts.join(' ')
}

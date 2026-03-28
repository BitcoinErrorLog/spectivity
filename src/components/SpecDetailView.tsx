'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Spec, ReviewStance } from '@/data/types'
import { getNamespace, stanceBgColor, stanceLabel } from '@/data/types'
import { getReviewsForSpec, getAttestationsForSpec, getCollectionsForSpec, getAuthor, getAllReviewers, getAllTrustPresets, buildReviewSummary } from '@/data/adapters'
import { ReviewBadges } from './ReviewBadges'
import { AttestationPanel } from './AttestationPanel'
import { CompareView } from './CompareView'
import { DiscussionThread } from './DiscussionThread'
import { ImplementationMatrix } from './ImplementationMatrix'
import { DependencyGraph } from './DependencyGraph'
import { cn } from '@/lib/cn'

type Tab = 'discussion' | 'reviews' | 'evidence' | 'compare'

export function SpecDetailView({ spec }: { spec: Spec }) {
  const [tab, setTab] = useState<Tab>('discussion')

  const reviews = getReviewsForSpec(spec.id)
  const attestations = getAttestationsForSpec(spec.id)
  const collections = getCollectionsForSpec(spec.id)
  const author = getAuthor(spec.authorPubky)
  const allReviewers = getAllReviewers()
  const presets = getAllTrustPresets()
  const summary = buildReviewSummary(spec.id)
  const ns = getNamespace(spec.namespace)

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Link href={`/${spec.namespace}`} className="text-xs text-text-tertiary hover:text-text-secondary mb-4 inline-block">
        &larr; Back to {ns.fullName}
      </Link>

      <div className="bg-surface border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className="text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
            style={{ backgroundColor: ns.color + '20', color: ns.color }}
          >
            {ns.label}
            {spec.specNumber != null ? ` ${spec.specNumber}` : ''}
          </span>
          <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-accent bg-accent-dim px-2 py-0.5 rounded">
            {spec.typeLabel}
          </span>
          {spec.status && (
            <span className="text-[0.65rem] text-text-tertiary bg-surface-2 px-2 py-0.5 rounded">
              {spec.status}
            </span>
          )}
          {spec.topicTags.map(tag => (
            <span key={tag} className="text-[0.65rem] text-text-tertiary bg-surface-2 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>

        <h1 className="font-display text-2xl font-bold mb-2 leading-snug">{spec.title}</h1>
        <p className="text-sm text-text-secondary leading-relaxed mb-4">{spec.summary}</p>

        <ReviewBadges summary={summary} />

        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border text-xs text-text-tertiary flex-wrap">
          <span>{author?.name ?? spec.githubAuthor ?? spec.authorPubky.slice(0, 16)}</span>
          <span>·</span>
          <span>Updated {new Date(spec.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <span>·</span>
          <span>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
          <span>·</span>
          <span>{attestations.length} attestation{attestations.length !== 1 ? 's' : ''}</span>
          {spec.sourceUrl && (
            <>
              <span>·</span>
              <a href={spec.sourceUrl} target="_blank" rel="noopener" className="text-accent hover:underline">
                View source
              </a>
            </>
          )}
        </div>

        {collections.length > 0 && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs text-text-tertiary">Collections:</span>
            {collections.map(c => (
              <Link
                key={c.id}
                href={`/collection/${c.id}`}
                className="text-xs text-accent bg-accent-dim px-2 py-0.5 rounded hover:underline"
              >
                {c.title}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 mb-6">
        <h2 className="font-display text-lg font-semibold mb-4">Specification</h2>
        <div className="prose prose-invert prose-sm max-w-none text-text-secondary leading-relaxed whitespace-pre-line text-sm">
          {spec.body.slice(0, 8000)}
          {spec.body.length > 8000 && (
            <p className="text-text-tertiary italic mt-4">
              [Truncated — <a href={spec.sourceUrl} target="_blank" rel="noopener" className="text-accent hover:underline">view full spec at source</a>]
            </p>
          )}
        </div>
      </div>

      <DependencyGraph spec={spec} />

      <div className="flex gap-1 mb-4 mt-6 bg-surface rounded-lg p-1 border border-border">
        {([
          ['discussion', 'Discussion'],
          ['reviews', `Reviews (${reviews.length})`],
          ['evidence', `Evidence (${attestations.length})`],
          ['compare', 'Compare Views'],
        ] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all',
              tab === key
                ? 'bg-surface-2 text-text-primary shadow-sm'
                : 'text-text-tertiary hover:text-text-secondary'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'discussion' && (
        <DiscussionThread specId={spec.id} specTitle={spec.title} />
      )}

      {tab === 'reviews' && (
        <div className="space-y-2">
          {reviews.length === 0 ? (
            <p className="text-sm text-text-tertiary italic text-center py-8">No reviews yet.</p>
          ) : (
            reviews.map(review => {
              const reviewer = allReviewers.find(r => r.pubky === review.reviewerPubky)
              return (
                <div key={review.id} className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-text-secondary flex-shrink-0">
                    {reviewer?.name?.split(' ').map(w => w[0]).join('').slice(0, 2) ?? '??'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/reviewer/${encodeURIComponent(review.reviewerPubky)}`}
                        className="text-sm font-medium text-text-primary hover:text-accent transition-colors"
                      >
                        {reviewer?.name ?? review.reviewerPubky.slice(0, 16)}
                      </Link>
                      <span className="text-xs text-text-tertiary">{reviewer?.role}</span>
                    </div>
                  </div>
                  <span className={cn(
                    'text-xs font-semibold px-2.5 py-1 rounded-full border',
                    stanceBgColor(review.label as ReviewStance)
                  )}>
                    {stanceLabel(review.label as ReviewStance)}
                  </span>
                </div>
              )
            })
          )}
        </div>
      )}

      {tab === 'evidence' && (
        <div className="space-y-4">
          <ImplementationMatrix spec={spec} />
          <AttestationPanel attestations={attestations} />
        </div>
      )}

      {tab === 'compare' && (
        <CompareView spec={spec} presets={presets} />
      )}
    </div>
  )
}

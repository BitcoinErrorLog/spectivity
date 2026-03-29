'use client'

import Link from 'next/link'
import type { Spec, ReviewSummary } from '@/data/types'
import { getNamespace } from '@/data/types'
import { ReviewBadges } from './ReviewBadges'
import { getAuthor, getCollectionsForSpec, getSourceLabel, getSourceColor } from '@/data/adapters'

interface SpecCardProps {
  spec: Spec
  summary: ReviewSummary
  explanation?: string
}

export function SpecCard({ spec, summary, explanation }: SpecCardProps) {
  const author = getAuthor(spec.authorPubky)
  const cols = getCollectionsForSpec(spec.id)
  const ns = getNamespace(spec.namespace)

  return (
    <Link
      href={`/${spec.namespace}/${spec.specNumber ?? spec.id}`}
      className="block bg-surface border border-border rounded-xl p-5 hover:border-border-2 transition-colors group"
    >
      <div className="flex items-start gap-3 mb-3">
        {spec.specNumber != null && (
          <span
            className="text-sm font-bold tabular-nums flex-shrink-0 mt-0.5"
            style={{ color: ns.color }}
          >
            {ns.label}&nbsp;{spec.specNumber}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            {spec.specNumber == null && (
              <span
                className="text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                style={{ backgroundColor: ns.color + '20', color: ns.color }}
              >
                {ns.label}
              </span>
            )}
            {spec.typeLabel && (
              <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-accent bg-accent-dim px-2 py-0.5 rounded">
                {spec.typeLabel}
              </span>
            )}
            {spec.source && spec.source !== 'direct' && spec.source !== 'merged' && (
              <span className={`text-[0.65rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${getSourceColor(spec.source)}`}>
                {getSourceLabel(spec.source)}
              </span>
            )}
          </div>
          <h3 className="text-base font-semibold text-text-primary group-hover:text-accent transition-colors leading-snug">
            {spec.title}
          </h3>
          {spec.topicTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {spec.topicTags.map(tag => (
                <span
                  key={tag}
                  className="text-[0.6rem] text-text-tertiary bg-surface-2 px-1.5 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-text-secondary leading-relaxed mb-3 line-clamp-2">
        {spec.summary}
      </p>

      <ReviewBadges summary={summary} compact />

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-text-tertiary">
          <span>{author?.name ?? spec.authorPubky.slice(0, 16)}</span>
          <span>·</span>
          <span>{formatDate(spec.updatedAt)}</span>
        </div>
        {cols.length > 0 && (
          <div className="flex items-center gap-1">
            {cols.slice(0, 2).map(c => (
              <span
                key={c.id}
                className="text-[0.6rem] text-text-tertiary bg-surface-2 px-1.5 py-0.5 rounded"
              >
                {c.title}
              </span>
            ))}
            {cols.length > 2 && (
              <span className="text-[0.6rem] text-text-tertiary">
                +{cols.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {explanation && (
        <p className="text-xs text-text-tertiary italic mt-2">
          {explanation}
        </p>
      )}
    </Link>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

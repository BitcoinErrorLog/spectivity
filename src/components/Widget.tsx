'use client'
import { useState } from 'react'
import { ReviewBadges } from './ReviewBadges'
import { buildReviewSummary } from '@/data/adapters'
import { cn } from '@/lib/cn'

const WIDGET_SPEC_ID = 'spec-ordinal-indexing'

const TRUST_VIEWS = [
  {
    id: 'all',
    label: 'All Reviewers',
    reviewers: [
      'pk:conservative-maintainer',
      'pk:wallet-standards-editor',
      'pk:experimental-researcher',
      'pk:merchant-builder',
      'pk:deployment-operator',
      'pk:minimalist-reviewer',
      'pk:documentation-purist',
      'pk:historical-librarian',
    ],
  },
  {
    id: 'conservative',
    label: 'Conservative Only',
    reviewers: [
      'pk:conservative-maintainer',
      'pk:minimalist-reviewer',
      'pk:deployment-operator',
    ],
  },
  {
    id: 'implementers',
    label: 'Implementers Only',
    reviewers: [
      'pk:merchant-builder',
      'pk:wallet-standards-editor',
      'pk:deployment-operator',
    ],
  },
]

export function Widget() {
  const [activeView, setActiveView] = useState('all')

  const currentView = TRUST_VIEWS.find(v => v.id === activeView)!
  const summary = buildReviewSummary(WIDGET_SPEC_ID, currentView.reviewers)

  const derivedStatus = deriveStatus(summary)

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex justify-center gap-1 mb-4 bg-surface rounded-lg p-1 border border-border">
        {TRUST_VIEWS.map(view => (
          <button
            key={view.id}
            onClick={() => setActiveView(view.id)}
            className={cn(
              'px-3 py-2 rounded-md text-xs font-medium transition-all flex-1',
              activeView === view.id
                ? 'bg-accent text-white shadow-sm'
                : 'text-text-tertiary hover:text-text-secondary'
            )}
          >
            {view.label}
          </button>
        ))}
      </div>

      <div
        className="bg-surface border border-border rounded-xl overflow-hidden transition-all duration-300"
        key={activeView}
      >
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-accent bg-accent-dim px-2 py-0.5 rounded">
              informational
            </span>
            <span className={cn(
              'text-[0.65rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded',
              derivedStatus.className
            )}>
              {derivedStatus.label}
            </span>
          </div>

          <h3 className="text-base font-display font-semibold mb-2 leading-snug">
            Ordinal Numbers: A Deterministic Satoshi Indexing Scheme
          </h3>

          <p className="text-sm text-text-secondary leading-relaxed mb-4">
            Defines a scheme for numbering and tracking individual satoshis across Bitcoin transactions.
          </p>

          <ReviewBadges summary={summary} />

          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-text-tertiary">
              {summary.total} review{summary.total !== 1 ? 's' : ''} from this set
            </span>
            <span className="text-xs text-blue-400">
              3 implementations
            </span>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-text-tertiary mt-3 italic">
        Same spec. Same data. Different trust lens.
      </p>
    </div>
  )
}

function deriveStatus(summary: ReturnType<typeof buildReviewSummary>) {
  if (summary.isContested) {
    return { label: 'Contested', className: 'bg-orange-400/15 text-orange-400' }
  }

  const positive = (summary.byStance['ack'] ?? 0) + (summary.byStance['concept-ack'] ?? 0)
  const negative = (summary.byStance['nack'] ?? 0) + (summary.byStance['deployment-risk'] ?? 0)

  if (positive > 0 && negative === 0) {
    return { label: 'Endorsed', className: 'bg-emerald-400/15 text-emerald-400' }
  }
  if (negative > 0 && positive === 0) {
    return { label: 'Not Recommended', className: 'bg-red-400/15 text-red-400' }
  }
  if (summary.total === 0) {
    return { label: 'Unreviewed', className: 'bg-surface-3 text-text-tertiary' }
  }
  return { label: 'Mixed', className: 'bg-amber-400/15 text-amber-400' }
}

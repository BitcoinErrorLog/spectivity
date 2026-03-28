'use client'
import { useState } from 'react'
import type { Spec, TrustPreset } from '@/data/types'
import { ReviewBadges } from './ReviewBadges'
import { buildReviewSummary, getAttestationsForSpec, getCollectionsForSpec, getAuthor } from '@/data/adapters'
import { buildExplanation } from '@/lib/ranking'
import { getAllReviewers } from '@/data/adapters'
import { cn } from '@/lib/cn'

interface CompareViewProps {
  spec: Spec
  presets: TrustPreset[]
}

export function CompareView({ spec, presets }: CompareViewProps) {
  const [selectedPresets, setSelectedPresets] = useState<string[]>(
    presets.slice(0, 3).map(p => p.id)
  )

  const allReviewerCount = getAllReviewers().length

  function togglePreset(id: string) {
    setSelectedPresets(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id].slice(-3)
    )
  }

  const columns = selectedPresets.map(presetId => {
    const preset = presets.find(p => p.id === presetId)!
    const summary = buildReviewSummary(spec.id, preset.includedReviewers)
    const explanation = buildExplanation(summary, preset.includedReviewers, allReviewerCount)
    return { preset, summary, explanation }
  })

  const attestations = getAttestationsForSpec(spec.id)
  const collections = getCollectionsForSpec(spec.id)
  const author = getAuthor(spec.authorPubky)

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {presets.map(p => (
          <button
            key={p.id}
            onClick={() => togglePreset(p.id)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              selectedPresets.includes(p.id)
                ? 'bg-accent text-white'
                : 'bg-surface-2 text-text-secondary hover:text-text-primary'
            )}
          >
            {p.title}
          </button>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-accent bg-accent-dim px-2 py-0.5 rounded">
            {spec.typeLabel}
          </span>
        </div>
        <h2 className="text-lg font-display font-semibold mb-1">{spec.title}</h2>
        <p className="text-sm text-text-secondary mb-2">{spec.summary}</p>
        <div className="flex items-center gap-2 text-xs text-text-tertiary">
          <span>{author?.name ?? spec.authorPubky.slice(0, 16)}</span>
          <span>·</span>
          <span>{attestations.length} attestation{attestations.length !== 1 ? 's' : ''}</span>
          <span>·</span>
          <span>{collections.length} collection{collections.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className={cn('grid gap-4', columns.length === 1 ? 'grid-cols-1' : columns.length === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
        {columns.map(({ preset, summary, explanation }) => (
          <div
            key={preset.id}
            className="bg-surface border border-border rounded-xl p-4"
          >
            <h4 className="text-sm font-semibold text-text-primary mb-1">
              {preset.title}
            </h4>
            <p className="text-xs text-text-tertiary mb-3">{preset.description}</p>

            <ReviewBadges summary={summary} />

            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-text-tertiary italic">{explanation}</p>

              <div className="mt-2 space-y-1">
                {summary.total === 0 ? (
                  <p className="text-xs text-text-tertiary">No reviews from this set.</p>
                ) : (
                  Object.entries(summary.byReviewer).map(([pubky, stance]) => {
                    const reviewer = getAllReviewers().find(r => r.pubky === pubky)
                    return (
                      <div key={pubky} className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary">{reviewer?.name ?? pubky.slice(0, 16)}</span>
                        <span className={cn('font-medium', stanceTextColor(stance))}>{stance.replace(/-/g, ' ')}</span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-text-tertiary mt-4 italic">
        Same spec. Same data. Different trust lens.
      </p>
    </div>
  )
}

function stanceTextColor(stance: string): string {
  const positive = ['ack', 'concept-ack']
  const negative = ['nack', 'deployment-risk', 'superseded']
  if (positive.includes(stance)) return 'text-emerald-400'
  if (negative.includes(stance)) return 'text-red-400'
  return 'text-amber-400'
}

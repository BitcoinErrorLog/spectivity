'use client'

import { cn } from '@/lib/cn'
import type { TrustPreset, Reviewer, PresetCriteria } from '@/data/types'
import type { SortMode } from '@/lib/ranking'

interface TrustFilterProps {
  presets: TrustPreset[]
  activePresetId: string
  onPresetChange: (id: string) => void
  reviewers: Reviewer[]
  activeReviewers: string[]
  onToggleReviewer: (pubky: string) => void
  sortMode: SortMode
  onSortChange: (mode: SortMode) => void
  collectionId?: string
  collections: { id: string; title: string }[]
  onCollectionChange: (id: string | undefined) => void
}

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'engagement', label: 'Most reviewed' },
  { value: 'recent', label: 'Most recent' },
  { value: 'implementations', label: 'Most implemented' },
  { value: 'controversial', label: 'Most contested' },
]

export function TrustFilter({
  presets,
  activePresetId,
  onPresetChange,
  reviewers,
  activeReviewers,
  onToggleReviewer,
  sortMode,
  onSortChange,
  collectionId,
  collections,
  onCollectionChange,
}: TrustFilterProps) {
  const activePreset = presets.find(p => p.id === activePresetId)

  return (
    <div className="bg-surface border border-border rounded-xl p-4 space-y-4">
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-2">
          Reviewer group
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(preset => (
            <button
              key={preset.id}
              onClick={() => onPresetChange(preset.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                activePresetId === preset.id
                  ? 'bg-accent text-white'
                  : 'bg-surface-2 text-text-secondary hover:text-text-primary hover:bg-surface-3'
              )}
              title={preset.description}
            >
              {preset.title}
              {preset.includedReviewers.length > 0 && (
                <span className="ml-1 opacity-70">({preset.includedReviewers.length})</span>
              )}
            </button>
          ))}
        </div>
        {activePreset && activePreset.criteria.type !== 'all' && (
          <div className="mt-2 px-3 py-2 bg-surface-2 rounded-lg">
            <CriteriaExplanation criteria={activePreset.criteria} />
          </div>
        )}
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-2">
          Individual reviewers
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {reviewers.map(reviewer => {
            const isActive = activeReviewers.includes(reviewer.pubky)
            return (
              <button
                key={reviewer.pubky}
                onClick={() => onToggleReviewer(reviewer.pubky)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs transition-all border',
                  isActive
                    ? 'bg-surface-3 border-border-2 text-text-primary'
                    : 'bg-surface border-transparent text-text-tertiary hover:text-text-secondary hover:border-border'
                )}
                title={`${reviewer.role} — ${reviewer.expertise.join(', ')}`}
              >
                {reviewer.name}
              </button>
            )
          })}
        </div>
        <p className="text-[0.65rem] text-text-tertiary mt-1.5">
          Toggle individual reviewers to customize your view. Anyone who has reviewed a spec appears here.
        </p>
      </div>

      <div className="flex items-center gap-4 pt-2 border-t border-border">
        <div className="flex-1">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-1.5">
            Sort
          </h4>
          <div className="flex gap-1">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => onSortChange(opt.value)}
                className={cn(
                  'px-2.5 py-1 rounded text-xs transition-colors',
                  sortMode === opt.value
                    ? 'bg-surface-3 text-text-primary'
                    : 'text-text-tertiary hover:text-text-secondary'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {collections.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-1.5">
              Collection
            </h4>
            <select
              value={collectionId ?? ''}
              onChange={e => onCollectionChange(e.target.value || undefined)}
              className="bg-surface-2 border border-border rounded-lg text-xs text-text-secondary px-2 py-1 outline-none focus:border-accent"
            >
              <option value="">All specs</option>
              {collections.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}

function CriteriaExplanation({ criteria }: { criteria: PresetCriteria }) {
  switch (criteria.type) {
    case 'all':
      return null
    case 'profile-tag':
      return (
        <div className="text-[0.7rem] text-text-tertiary space-y-1">
          <p className="font-medium text-text-secondary">How this group is formed:</p>
          <p>
            Reviewers whose profiles have been tagged
            {' '}{criteria.tags.map((t, i) => (
              <span key={t}>
                {i > 0 && ' or '}
                <code className="bg-surface-3 px-1 rounded text-accent">{t}</code>
              </span>
            ))}
            {' '}by other users in the semantic social graph.
          </p>
          <p className="italic">
            Anyone can tag a reviewer's profile. The tags you see depend on whose
            tagging you trust. In production, this filters through your own trust graph.
          </p>
        </div>
      )
    case 'named-list':
      return (
        <div className="text-[0.7rem] text-text-tertiary space-y-1">
          <p className="font-medium text-text-secondary">How this group is formed:</p>
          <p>
            A curated list published by{' '}
            <code className="bg-surface-3 px-1 rounded text-text-secondary">{criteria.curatorPubky}</code>
            {' '}named "{criteria.listName}".
          </p>
          <p>{criteria.description}</p>
          <p className="italic">
            Anyone can publish a competing list of the same type with different members.
            You choose whose list to trust.
          </p>
        </div>
      )
    case 'has-reviewed':
      return (
        <div className="text-[0.7rem] text-text-tertiary space-y-1">
          <p className="font-medium text-text-secondary">How this group is formed:</p>
          <p>
            Anyone who has reviewed specs tagged
            {' '}{criteria.topicTags.map((t, i) => (
              <span key={t}>
                {i > 0 && ' or '}
                <code className="bg-surface-3 px-1 rounded text-accent">{t}</code>
              </span>
            ))}.
          </p>
          <p className="italic">
            Membership is automatic based on review activity. No one assigns this role.
          </p>
        </div>
      )
  }
}

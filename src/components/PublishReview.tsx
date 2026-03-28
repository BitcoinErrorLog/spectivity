'use client'
import { useState } from 'react'
import { publishReview } from '@/lib/publish'
import type { ReviewStance } from '@/data/types'
import { stanceBgColor, stanceLabel } from '@/data/types'
import { cn } from '@/lib/cn'

const ALL_STANCES: ReviewStance[] = [
  'ack', 'concept-ack', 'needs-work', 'editorial-issue',
  'deployment-risk', 'duplicate', 'superseded', 'nack',
]

interface PublishReviewProps {
  specUri: string
  specTitle: string
  reviewerPubky: string
  onPublished?: (tagId: string) => void
}

export function PublishReview({ specUri, specTitle, reviewerPubky, onPublished }: PublishReviewProps) {
  const [selectedStance, setSelectedStance] = useState<ReviewStance | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!selectedStance) return

    setSubmitting(true)
    const result = await publishReview(reviewerPubky, {
      specUri,
      stance: selectedStance,
    })

    if (result.success) {
      onPublished?.(result.tagId)
      setSelectedStance(null)
    }
    setSubmitting(false)
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <h4 className="text-sm font-semibold mb-1">Review this spec</h4>
      <p className="text-xs text-text-tertiary mb-3 line-clamp-1">{specTitle}</p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {ALL_STANCES.map(stance => (
          <button
            key={stance}
            onClick={() => setSelectedStance(stance)}
            className={cn(
              'px-2.5 py-1 rounded-full border text-xs font-medium transition-all',
              selectedStance === stance
                ? stanceBgColor(stance)
                : 'bg-surface-2 border-border text-text-tertiary hover:text-text-secondary'
            )}
          >
            {stanceLabel(stance)}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[0.65rem] text-text-tertiary">
          Writes PubkyAppTag to your homeserver.
        </p>
        <button
          onClick={handleSubmit}
          disabled={!selectedStance || submitting}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
            !selectedStance || submitting
              ? 'bg-surface-3 text-text-tertiary cursor-not-allowed'
              : 'bg-accent text-white hover:bg-accent-hover'
          )}
        >
          {submitting ? 'Publishing...' : 'Submit Review'}
        </button>
      </div>
    </div>
  )
}

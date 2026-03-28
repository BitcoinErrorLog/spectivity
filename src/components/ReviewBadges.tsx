import type { ReviewSummary, ReviewStance } from '@/data/types'
import { stanceBgColor, stanceLabel } from '@/data/types'
import { cn } from '@/lib/cn'

interface ReviewBadgesProps {
  summary: ReviewSummary
  compact?: boolean
}

export function ReviewBadges({ summary, compact }: ReviewBadgesProps) {
  const entries = Object.entries(summary.byStance)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)

  if (entries.length === 0) {
    return (
      <span className="text-xs text-text-tertiary italic">No reviews</span>
    )
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {entries.map(([stance, count]) => (
        <span
          key={stance}
          className={cn(
            'inline-flex items-center gap-1 rounded-full border text-xs font-medium',
            compact ? 'px-2 py-0.5' : 'px-2.5 py-1',
            stanceBgColor(stance as ReviewStance)
          )}
        >
          <span>{count}</span>
          <span>{stanceLabel(stance as ReviewStance)}</span>
        </span>
      ))}
      {summary.implementations > 0 && (
        <span className={cn(
          'inline-flex items-center gap-1 rounded-full border text-xs font-medium bg-blue-400/15 border-blue-400/30 text-blue-400',
          compact ? 'px-2 py-0.5' : 'px-2.5 py-1',
        )}>
          <span>{summary.implementations}</span>
          <span>implemented</span>
        </span>
      )}
      {summary.isContested && (
        <span className={cn(
          'inline-flex items-center rounded-full border text-xs font-medium bg-orange-400/15 border-orange-400/30 text-orange-400',
          compact ? 'px-2 py-0.5' : 'px-2.5 py-1',
        )}>
          contested
        </span>
      )}
    </div>
  )
}

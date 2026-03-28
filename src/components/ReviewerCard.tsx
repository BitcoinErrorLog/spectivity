import Link from 'next/link'
import type { Reviewer } from '@/data/types'
import { cn } from '@/lib/cn'

interface ReviewerCardProps {
  reviewer: Reviewer
  compact?: boolean
}

export function ReviewerCard({ reviewer, compact }: ReviewerCardProps) {
  const initials = reviewer.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)

  return (
    <Link
      href={`/reviewer/${encodeURIComponent(reviewer.pubky)}`}
      className={cn(
        'flex items-start gap-3 bg-surface border border-border rounded-xl transition-colors hover:border-border-2',
        compact ? 'p-3' : 'p-4',
      )}
    >
      <div className="w-9 h-9 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-text-secondary flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={cn('font-semibold text-text-primary', compact ? 'text-sm' : 'text-base')}>
          {reviewer.name}
        </h4>
        <p className="text-xs text-accent font-medium">{reviewer.role}</p>
        {!compact && (
          <p className="text-xs text-text-secondary mt-1 line-clamp-2">{reviewer.bio}</p>
        )}
        <div className="flex flex-wrap gap-1 mt-1.5">
          {reviewer.expertise.slice(0, compact ? 2 : 4).map(tag => (
            <span key={tag} className="text-[0.6rem] text-text-tertiary bg-surface-2 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}

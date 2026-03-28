import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getReviewer, getReviewsByReviewer, getSpec } from '@/data/adapters'
import { stanceBgColor, stanceLabel, type ReviewStance } from '@/data/types'
import { cn } from '@/lib/cn'

interface Props {
  params: Promise<{ pubky: string }>
}

export default async function ReviewerPage({ params }: Props) {
  const { pubky } = await params
  const decodedPubky = decodeURIComponent(pubky)
  const reviewer = getReviewer(decodedPubky)
  if (!reviewer) notFound()

  const reviews = getReviewsByReviewer(reviewer.pubky)

  const initials = reviewer.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)

  const stanceCounts: Record<string, number> = {}
  for (const r of reviews) {
    stanceCounts[r.label] = (stanceCounts[r.label] ?? 0) + 1
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Link href="/" className="text-xs text-text-tertiary hover:text-text-secondary mb-4 inline-block">
        &larr; Back
      </Link>

      <div className="bg-surface border border-border rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-surface-3 flex items-center justify-center text-lg font-bold text-text-secondary flex-shrink-0">
            {initials}
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">{reviewer.name}</h1>
            <p className="text-sm text-accent font-medium mb-2">{reviewer.role}</p>
            <p className="text-sm text-text-secondary leading-relaxed">{reviewer.bio}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {reviewer.expertise.map(tag => (
                <span key={tag} className="text-xs text-text-tertiary bg-surface-2 px-2 py-0.5 rounded">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-tertiary mb-3">Review Pattern</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(stanceCounts).map(([stance, count]) => (
            <span key={stance} className={cn('inline-flex items-center gap-1 rounded-full border text-xs font-medium px-2.5 py-1', stanceBgColor(stance as ReviewStance))}>
              {count} {stanceLabel(stance as ReviewStance)}
            </span>
          ))}
          <span className="text-xs text-text-tertiary self-center">{reviews.length} total</span>
        </div>
      </div>

      <h2 className="font-display text-lg font-semibold mb-4">Review History</h2>
      <div className="space-y-2">
        {reviews.map(review => {
          const spec = getSpec(review.specId)
          return (
            <Link
              key={review.id}
              href={spec ? `/${spec.namespace}/${spec.specNumber ?? spec.id}` : '#'}
              className="flex items-center gap-4 bg-surface border border-border rounded-xl p-4 hover:border-border-2 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-text-primary">{spec?.title ?? review.specId}</h4>
                <p className="text-xs text-text-tertiary mt-0.5">{spec?.typeLabel} · {spec?.topicTags.slice(0, 3).join(', ')}</p>
              </div>
              <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0', stanceBgColor(review.label))}>
                {stanceLabel(review.label)}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

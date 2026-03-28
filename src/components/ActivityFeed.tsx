'use client'

import Link from 'next/link'
import { getAllSpecs, getReviewsForSpec, getAuthor } from '@/data/adapters'
import { getNamespace, stanceBgColor, stanceLabel, type ReviewStance } from '@/data/types'
import { getAllDiscussions } from '@/data/discussions'

interface FeedItem {
  type: 'spec' | 'review' | 'discussion'
  timestamp: number
  specId: string
  namespace: string
  specTitle: string
  specNumber?: number
  detail: string
  author: string
}

export function ActivityFeed() {
  const specs = getAllSpecs()
  const discussions = getAllDiscussions()
  const items: FeedItem[] = []

  for (const spec of specs.slice(0, 30)) {
    items.push({
      type: 'spec',
      timestamp: new Date(spec.createdAt).getTime(),
      specId: spec.id,
      namespace: spec.namespace,
      specTitle: spec.title,
      specNumber: spec.specNumber,
      detail: spec.source === 'merged' ? 'Merged' : spec.source === 'open-pr' ? 'PR opened' : spec.source === 'rejected-pr' ? 'Rejected' : 'Published',
      author: spec.githubAuthor ?? getAuthor(spec.authorPubky)?.name ?? 'Unknown',
    })

    const reviews = getReviewsForSpec(spec.id)
    for (const review of reviews) {
      const reviewer = getAuthor(review.reviewerPubky)
      items.push({
        type: 'review',
        timestamp: review.createdAt,
        specId: spec.id,
        namespace: spec.namespace,
        specTitle: spec.title,
        specNumber: spec.specNumber,
        detail: stanceLabel(review.label),
        author: reviewer?.name ?? review.reviewerPubky.replace('pk:gh-', ''),
      })
    }
  }

  for (const disc of discussions) {
    const spec = specs.find(s => s.id === disc.specId)
    if (spec) {
      items.push({
        type: 'discussion',
        timestamp: new Date(disc.createdAt).getTime(),
        specId: spec.id,
        namespace: spec.namespace,
        specTitle: spec.title,
        specNumber: spec.specNumber,
        detail: disc.body.slice(0, 80) + (disc.body.length > 80 ? '...' : ''),
        author: disc.authorName,
      })
    }
  }

  items.sort((a, b) => b.timestamp - a.timestamp)
  const recent = items.slice(0, 15)

  return (
    <div>
      <h2 className="font-display text-lg font-semibold mb-4">Recent activity</h2>
      <div className="space-y-1.5">
        {recent.map((item, i) => {
          const ns = getNamespace(item.namespace)
          const href = `/${item.namespace}/${item.specNumber ?? item.specId}`
          return (
            <Link
              key={`${item.type}-${item.specId}-${i}`}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface transition-colors group"
            >
              <span
                className="text-[0.6rem] font-bold px-1.5 py-0.5 rounded flex-shrink-0 w-10 text-center"
                style={{ backgroundColor: ns.color + '20', color: ns.color }}
              >
                {ns.label}
              </span>
              <span className="text-xs text-text-tertiary w-16 flex-shrink-0">
                {item.type === 'spec' ? 'Spec' : item.type === 'review' ? 'Review' : 'Comment'}
              </span>
              <span className="text-sm text-text-secondary flex-1 min-w-0 truncate group-hover:text-text-primary transition-colors">
                {item.type === 'review'
                  ? `${item.author} → ${item.detail} on ${item.specTitle}`
                  : item.type === 'discussion'
                    ? `${item.author}: "${item.detail}"`
                    : `${item.specTitle} (${item.detail} by ${item.author})`
                }
              </span>
              <span className="text-[0.65rem] text-text-tertiary flex-shrink-0">
                {formatRelative(item.timestamp)}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts
  const days = Math.floor(diff / 86400000)
  if (days > 365) return `${Math.floor(days / 365)}y ago`
  if (days > 30) return `${Math.floor(days / 30)}mo ago`
  if (days > 0) return `${days}d ago`
  const hours = Math.floor(diff / 3600000)
  if (hours > 0) return `${hours}h ago`
  return 'just now'
}

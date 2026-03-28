import type { Metadata } from 'next'
import { getAllSpecs, buildReviewSummary, getReviewsForSpec } from '@/data/adapters'
import { getNamespace } from '@/data/types'
import { SpecCard } from '@/components/SpecCard'

export const metadata: Metadata = {
  title: 'Trending Specs',
  description: 'The most active, most reviewed, and most discussed protocol specs right now.',
}

export default function TrendingPage() {
  const specs = getAllSpecs()

  const withActivity = specs.map(spec => {
    const reviews = getReviewsForSpec(spec.id)
    const summary = buildReviewSummary(spec.id)
    return { spec, summary, reviewCount: reviews.length, engagement: reviews.length + summary.implementations * 2 }
  })

  const mostReviewed = [...withActivity]
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 10)

  const mostRecent = [...withActivity]
    .sort((a, b) => new Date(b.spec.updatedAt).getTime() - new Date(a.spec.updatedAt).getTime())
    .slice(0, 10)

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="font-display text-2xl font-bold mb-2">Trending</h1>
      <p className="text-sm text-text-secondary mb-8">The most active specs across all ecosystems.</p>

      <section className="mb-10">
        <h2 className="font-display text-lg font-semibold mb-4">Most reviewed</h2>
        <div className="space-y-3">
          {mostReviewed.map(({ spec, summary }) => (
            <SpecCard key={spec.id} spec={spec} summary={summary} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold mb-4">Recently updated</h2>
        <div className="space-y-3">
          {mostRecent.map(({ spec, summary }) => (
            <SpecCard key={spec.id} spec={spec} summary={summary} />
          ))}
        </div>
      </section>
    </div>
  )
}

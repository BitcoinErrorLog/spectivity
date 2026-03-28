import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCollection, getSpec, getAuthor, buildReviewSummary } from '@/data/adapters'
import { SpecCard } from '@/components/SpecCard'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CollectionPage({ params }: Props) {
  const { id } = await params
  const collection = getCollection(id)
  if (!collection) notFound()

  const curator = getAuthor(collection.curatorPubky)
  const specsWithSummaries = collection.specIds
    .map(sid => getSpec(sid))
    .filter(Boolean)
    .map(spec => ({ spec: spec!, summary: buildReviewSummary(spec!.id) }))

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Link href="/" className="text-xs text-text-tertiary hover:text-text-secondary mb-4 inline-block">
        &larr; Back
      </Link>

      <div className="bg-surface border border-border rounded-xl p-6 mb-6">
        <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-accent bg-accent-dim px-2 py-0.5 rounded">
          Collection
        </span>
        <h1 className="font-display text-2xl font-bold mt-2 mb-2">{collection.title}</h1>
        <p className="text-sm text-text-secondary leading-relaxed mb-3">{collection.description}</p>
        <div className="flex items-center gap-2 text-xs text-text-tertiary">
          <span>Curated by {curator?.name ?? collection.curatorPubky.slice(0, 16)}</span>
          <span>·</span>
          <span>{specsWithSummaries.length} spec{specsWithSummaries.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="space-y-3">
        {specsWithSummaries.map(({ spec, summary }) => (
          <SpecCard key={spec.id} spec={spec} summary={summary} />
        ))}
      </div>
    </div>
  )
}

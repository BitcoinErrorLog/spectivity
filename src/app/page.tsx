import Link from 'next/link'
import { getAllSpecs } from '@/data/adapters'
import { NAMESPACES } from '@/data/types'

export default function Home() {
  const specs = getAllSpecs()

  const nsCounts: Record<string, number> = {}
  const nsMergedCounts: Record<string, number> = {}
  for (const s of specs) {
    nsCounts[s.namespace] = (nsCounts[s.namespace] ?? 0) + 1
    if (s.source === 'merged') {
      nsMergedCounts[s.namespace] = (nsMergedCounts[s.namespace] ?? 0) + 1
    }
  }

  const totalMerged = Object.values(nsMergedCounts).reduce((a, b) => a + b, 0)

  return (
    <div className="max-w-5xl mx-auto px-6">
      <section className="text-center pt-16 pb-12">
        <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-4">
          The Protocol Spec Registry
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed mb-2">
          Search, read, and review {totalMerged.toLocaleString()}+ protocol specifications across Bitcoin, Lightning, Nostr, BitTorrent, IPFS, and more.
        </p>
        <p className="text-base text-text-tertiary max-w-xl mx-auto leading-relaxed">
          Filter by topic, sort by number, and track reviewer sentiment in one place.
        </p>
      </section>

      <section className="pb-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
          {NAMESPACES.filter(ns => ns.id !== 'other').map(ns => {
            const total = nsCounts[ns.id] ?? 0
            const merged = nsMergedCounts[ns.id] ?? 0
            return (
              <Link
                key={ns.id}
                href={`/${ns.id}`}
                className="bg-surface border border-border rounded-xl px-5 py-4 hover:border-border-2 transition-colors group"
              >
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded inline-block mb-2"
                  style={{ backgroundColor: ns.color + '20', color: ns.color }}
                >
                  {ns.label}
                </span>
                <p className="text-sm text-text-primary group-hover:text-accent transition-colors font-medium mb-1">
                  {ns.fullName}
                </p>
                <p className="text-xs text-text-tertiary">
                  {merged > 0 && <>{merged} merged</>}
                  {total > merged && <>{merged > 0 ? ' · ' : ''}{total - merged} proposals</>}
                  {total === 0 && 'No specs yet'}
                </p>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-4 pb-12">
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="font-display font-semibold text-sm mb-2">Complete coverage</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Every BIP, NIP, BOLT, BEP, SLIP, CAIP, and IPIP — merged, open, and rejected — synced directly from their official repositories.
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="font-display font-semibold text-sm mb-2">Structured reviews</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            GitHub PR reviews are parsed and attributed. Filter by individual reviewers to see specs through the lens of experts you trust.
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="font-display font-semibold text-sm mb-2">Search and filter</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Filter specs by topic tag, sort by number or activity, and search across titles and summaries within each ecosystem.
          </p>
        </div>
      </section>

      <section className="text-center pb-16 border-t border-border pt-12">
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/learn" className="px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors">
            Why This Matters
          </Link>
          <Link href="/faq" className="px-5 py-2.5 bg-surface-2 text-text-secondary rounded-lg text-sm font-medium border border-border hover:text-text-primary hover:bg-surface-3 transition-colors">
            How Does This Work?
          </Link>
          <Link href="/about" className="px-5 py-2.5 bg-surface-2 text-text-secondary rounded-lg text-sm font-medium border border-border hover:text-text-primary hover:bg-surface-3 transition-colors">
            About Spectivity
          </Link>
        </div>
      </section>
    </div>
  )
}

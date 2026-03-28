import Link from 'next/link'
import { Widget } from '@/components/Widget'
import { getAllSpecs, getActiveNamespaces } from '@/data/adapters'
import { NAMESPACES } from '@/data/types'
import { ActivityFeed } from '@/components/ActivityFeed'

export default function Home() {
  const specs = getAllSpecs()
  const namespaces = getActiveNamespaces()

  const nsCounts: Record<string, number> = {}
  for (const s of specs) {
    nsCounts[s.namespace] = (nsCounts[s.namespace] ?? 0) + 1
  }

  return (
    <div className="max-w-5xl mx-auto px-6">
      <section className="text-center pt-16 pb-12">
        <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-4">
          Every spec. Every opinion. Your trust.
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed mb-2">
          The cross-ecosystem registry for protocol specs, structured reviews, and community sentiment.
        </p>
        <p className="text-base text-text-tertiary max-w-2xl mx-auto leading-relaxed">
          BIPs, NIPs, BOLTs, BEPs — read any spec, see who reviewed it, filter by whose judgment you trust.
        </p>
      </section>

      <section className="pb-12">
        <div className="text-center mb-6">
          <p className="text-sm text-text-tertiary">
            Toggle trust filters. Watch the same spec change meaning.
          </p>
        </div>
        <Widget />
      </section>

      <section className="pb-12">
        <h2 className="font-display text-xl font-semibold text-center mb-6">
          Browse by ecosystem
        </h2>
        <div className="grid sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
          {NAMESPACES.filter(ns => ns.id !== 'other').map(ns => {
            const count = nsCounts[ns.id] ?? 0
            return (
              <Link
                key={ns.id}
                href={`/${ns.id}`}
                className="flex items-center gap-3 bg-surface border border-border rounded-lg px-4 py-3 hover:border-border-2 transition-colors group"
              >
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded flex-shrink-0"
                  style={{ backgroundColor: ns.color + '20', color: ns.color }}
                >
                  {ns.label}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-text-primary group-hover:text-accent transition-colors">{ns.fullName}</span>
                  {count > 0 && (
                    <span className="text-xs text-text-tertiary ml-2">{count} specs</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-4 pb-12">
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="font-display font-semibold text-sm mb-2">Authors publish freely</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Specs exist when their authors publish them. Editors are relieved of the burden of deciding what gets to exist.
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="font-display font-semibold text-sm mb-2">Reviews are structured</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Expert reviews are signed, tagged by stance, and independently discoverable. Disagreement becomes legible, not noisy.
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="font-display font-semibold text-sm mb-2">Trust is yours to define</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Filter by whose judgment you trust. The same spec looks different through different trust lenses.
          </p>
        </div>
      </section>

      <section className="pb-16">
        <ActivityFeed />
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

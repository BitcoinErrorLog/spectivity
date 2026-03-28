import type { Metadata } from 'next'
import Link from 'next/link'
import { NAMESPACES } from '@/data/types'

export const metadata: Metadata = {
  title: 'About Spectivity',
  description: 'What Spectivity is, how it works, and what powers it.',
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl font-bold mb-4">About Spectivity</h1>

      <div className="space-y-8 text-[0.925rem] text-text-secondary leading-relaxed">
        <section>
          <h2 className="font-display text-xl font-semibold text-text-primary mb-3">What this is</h2>
          <p>
            Spectivity is a cross-ecosystem registry for protocol specifications. It mirrors
            specs from multiple GitHub repositories — BIPs, NIPs, BOLTs, BEPs — and presents
            them in a unified interface with structured review sentiment, threaded discussion,
            trust-based filtering, and implementation tracking.
          </p>
          <p className="mt-3">
            The goal is to make protocol specification review more legible, more structured,
            and less dependent on any single editorial bottleneck.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-text-primary mb-3">How it works</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Mirror sync.</strong> A sync script watches upstream GitHub repositories
              and mirrors merged specs, open PRs, and closed/rejected proposals into the registry.
              PR comments containing ACK/NACK signals are extracted as structured reviews.
            </li>
            <li>
              <strong>Direct publication.</strong> Authors can also publish specs directly using
              their own Pubky identity, independent of any GitHub repository.
            </li>
            <li>
              <strong>Structured review.</strong> Reviews are tagged by stance (ACK, NACK,
              concept-ack, needs-work, etc.) and associated with identified reviewers. Review
              sentiment is aggregated per spec.
            </li>
            <li>
              <strong>Trust filtering.</strong> Readers choose whose reviews they trust. The
              same spec can appear differently depending on which reviewer group you select.
            </li>
            <li>
              <strong>Threaded discussion.</strong> Each spec has a discussion section with
              nested threads, separate from the review layer.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-text-primary mb-3">Ecosystems indexed</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {NAMESPACES.filter(n => n.id !== 'other').map(ns => (
              <div key={ns.id} className="bg-surface border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: ns.color + '20', color: ns.color }}>
                    {ns.label}
                  </span>
                  <span className="text-sm font-medium text-text-primary">{ns.fullName}</span>
                </div>
                <p className="text-xs text-text-tertiary">{ns.description}</p>
                {ns.repo && (
                  <a href={`https://github.com/${ns.repo}`} target="_blank" rel="noopener" className="text-xs text-accent hover:underline mt-1 inline-block">
                    {ns.repo}
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-text-primary mb-3">Powered by Pubky</h2>
          <p>
            Spectivity is built on{' '}
            <a href="https://pubky.org" target="_blank" rel="noopener" className="text-accent hover:underline">Pubky Core</a>
            {' '}— an open protocol where identity is a public key, data lives on user-controlled
            homeservers, and the semantic social graph enables trust-based filtering and discovery.
          </p>
          <p className="mt-3">
            Reviews, discussions, and attestations published on Spectivity are signed data objects
            that can be independently verified, portably stored, and accessed through any compatible
            indexer. No single server controls the data.
          </p>
          <p className="mt-3">
            Built by{' '}
            <a href="https://synonym.to" target="_blank" rel="noopener" className="text-accent hover:underline">Synonym</a>.
          </p>
        </section>

        <div className="border-t border-border pt-8 flex justify-center gap-3">
          <Link href="/bip" className="px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors">
            Browse Specs
          </Link>
          <Link href="/learn" className="px-5 py-2.5 bg-surface-2 text-text-secondary rounded-lg text-sm font-medium border border-border hover:text-text-primary hover:bg-surface-3 transition-colors">
            Why This Matters
          </Link>
        </div>
      </div>
    </div>
  )
}

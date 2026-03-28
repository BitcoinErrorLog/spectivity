import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Why This Matters',
  description: 'Standards editors carry too many roles at once. Here is how to separate them.',
}

export default function LearnPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <article className="space-y-8">
        <header>
          <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight mb-4">
            Better Tools for Open Standards
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed">
            Standards editors carry too many roles at once. Here is how to separate them.
          </p>
        </header>

        <Section title="The structural problem">
          <p>
            Standards repositories like the BIP process exist to coordinate open development.
            The people who maintain them do real, important, largely volunteer work: reviewing
            proposals, maintaining quality, keeping things organized. That work deserves respect.
          </p>
          <p>
            The problem is not the people. The problem is that a single process is expected to handle
            too many distinct jobs at once: deciding whether a proposal gets published, assigning it
            a number, providing expert review, moderating discussion, and signaling legitimacy to the ecosystem.
          </p>
          <p>
            When one process carries all of these responsibilities, every editorial decision
            is overloaded with meaning. A merge looks like endorsement. A rejection looks like erasure.
            An open PR sitting for years looks like neglect. None of those impressions may be accurate,
            but the architecture makes them inevitable.
          </p>
        </Section>

        <Section title="Why another website is not the answer">
          <p>
            When frustration arises, the instinct is to fork: make another repository, another website.
            But forks face a cold-start problem. The original process retains social gravity.
          </p>
          <p>
            A better approach is not to compete with existing processes but to provide supplementary
            infrastructure that separates the roles they currently bundle. The existing process continues.
            Spectivity adds layers around it.
          </p>
        </Section>

        <Section title="Separating the layers">
          <p>
            Publication, review, curation, and adoption tracking are independent acts by independent
            parties, each with their own signed data:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Authors</strong> publish specs under their own keys.</li>
            <li><strong>Reviewers</strong> publish signed reviews — visible and attributable, but not controlling the spec&apos;s existence.</li>
            <li><strong>Curators</strong> maintain collections with optional numbering.</li>
            <li><strong>Implementers</strong> publish evidence of deployment, compatibility, or testing.</li>
            <li><strong>Readers</strong> choose which reviewers and curators they trust.</li>
          </ul>
          <p>
            Expert review is elevated, not diminished. An ACK from a respected reviewer carries more
            weight when it is a signed, independent, unforgeable object rather than a comment buried in a thread.
          </p>
        </Section>

        <Section title="How Spectivity works">
          <p>
            Spectivity mirrors existing spec repositories (bitcoin/bips, nostr-protocol/nips, lightning/bolts,
            bittorrent/bittorrent.org) and presents them alongside direct publications in a unified registry
            with structured review, trust filtering, and threaded discussion.
          </p>
          <p>
            Nobody needs to change their workflow. The existing processes continue exactly as they are.
            Spectivity adds a view layer that makes review sentiment, implementation status, and community
            opinion visible and filterable.
          </p>
        </Section>

        <Section title="Every ecosystem">
          <p>
            The same separation of concerns applies to every standards process — NIPs, BOLTs, BEPs,
            and any future protocol spec ecosystem. Each community does valuable coordination work.
            Each would benefit from infrastructure that lets editors focus on review quality rather than
            bearing the full weight of publication, numbering, legitimacy, and moderation simultaneously.
          </p>
        </Section>

        <div className="border-t border-border pt-8 flex justify-center gap-3">
          <Link href="/bip" className="px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors">
            Browse Specs
          </Link>
          <Link href="/faq" className="px-5 py-2.5 bg-surface-2 text-text-secondary rounded-lg text-sm font-medium border border-border hover:text-text-primary hover:bg-surface-3 transition-colors">
            How Does This Work?
          </Link>
        </div>
      </article>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold mb-3">{title}</h2>
      <div className="space-y-3 text-[0.925rem] text-text-secondary leading-relaxed">{children}</div>
    </section>
  )
}

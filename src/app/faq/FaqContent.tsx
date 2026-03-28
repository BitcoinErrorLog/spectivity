'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/cn'

interface FAQEntry {
  question: string
  answer: React.ReactNode
  category: 'mechanism' | 'trust' | 'migration' | 'objection'
}

const FAQS: FAQEntry[] = [
  // --- MECHANISM: How does this actually work? ---
  {
    category: 'mechanism',
    question: 'Where does a spec actually live? Who hosts it?',
    answer: (
      <>
        <p>
          A spec is a JSON object stored on the author's Pubky homeserver at a deterministic path:
        </p>
        <Code>pubky://{'<author_public_key>'}/pub/pubky.app/posts/{'<timestamp_id>'}</Code>
        <p>
          The author chooses their homeserver. They can self-host or use any compatible host.
          The homeserver is an HTTP key-value store — it holds the data, but it does not control it.
          If the host disappears or becomes hostile, the author updates their PKARR record
          (a signed DNS-like record on the Mainline BitTorrent DHT) to point at a new host,
          and their data moves with them. That is credible exit.
        </p>
        <p>
          No single server has to agree to publish the spec.
          The spec exists because the author signed it and placed it on a server they control.
        </p>
      </>
    ),
  },
  {
    category: 'mechanism',
    question: 'What is PKARR and why does it matter here?',
    answer: (
      <>
        <p>
          PKARR (Public Key Addressable Resource Records) is how Pubky does discovery without DNS registrars
          or centralized directories. An Ed25519 public key is published as a signed record on the Mainline
          BitTorrent DHT — the same DHT that serves billions of torrent lookups daily. The record tells
          anyone where the key owner's homeserver is.
        </p>
        <p>
          This means: given a public key, anyone can find the homeserver, fetch the data, and verify the
          signature — without asking any central authority for permission, and without the author needing
          to register a domain name.
        </p>
        <p>
          If the author moves to a different homeserver, they update their PKARR record. Clients following
          the key automatically discover the new location. The key is the stable anchor, not the server.
        </p>
      </>
    ),
  },
  {
    category: 'mechanism',
    question: 'How do reviews work? How do I know a review is authentic?',
    answer: (
      <>
        <p>
          A review is a tag object stored on the <em>reviewer's</em> homeserver, not on the spec author's server.
          It points at the spec's URI and carries a label like <code className="text-xs bg-surface-2 px-1 rounded">ack</code>,{' '}
          <code className="text-xs bg-surface-2 px-1 rounded">nack</code>, or{' '}
          <code className="text-xs bg-surface-2 px-1 rounded">needs-work</code>.
        </p>
        <Code>{`pubky://<reviewer_pk>/pub/pubky.app/tags/<blake3_hash>`}</Code>
        <p>
          Authenticity comes from the same property that makes all Pubky data verifiable: the reviewer's
          public key owns the path. The homeserver enforces that only the key holder can write to their namespace.
          Anyone fetching the tag can verify that it was written by the key it claims to be from.
        </p>
        <p>
          No one can forge a review under someone else's key. No one can delete a review from someone else's server.
          The reviewer controls their own opinion independently of the spec author and any curator.
        </p>
      </>
    ),
  },
  {
    category: 'mechanism',
    question: 'What is the indexer (Nexus)? Can it censor specs?',
    answer: (
      <>
        <p>
          Nexus is an indexer that crawls Pubky homeservers via their event streams, aggregates the data
          into Neo4j (graph) and Redis (cache), and serves it through a REST API. It enables search,
          tag counts, trending labels, and feed construction.
        </p>
        <p>
          Can it censor? An indexer can choose not to index something. But:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>The spec still exists on the author's homeserver. Anyone with the URI can fetch it directly.</li>
          <li>Anyone can run their own indexer. Nexus is open source.</li>
          <li>Multiple indexers can coexist, each with different inclusion policies. Users choose which indexer to query.</li>
        </ul>
        <p>
          This is the structural difference from a GitHub repository. If one GitHub repo rejects your PR,
          the PR is gone from the canonical location. If one Nexus instance doesn't index your spec,
          the spec is still live at its URI and discoverable by any other indexer or direct lookup.
        </p>
      </>
    ),
  },
  {
    category: 'mechanism',
    question: 'How does versioning work? Can specs be updated?',
    answer: (
      <>
        <p>
          A spec revision is a new post with the <code className="text-xs bg-surface-2 px-1 rounded">parent</code> field
          pointing to the previous revision's URI. The original post is never mutated. Each version
          is a distinct, immutable, independently addressable object.
        </p>
        <p>
          This means: the full revision history is a linked list of signed posts. Anyone can walk the chain.
          No one can silently modify a previous version because each post is stored at a content-derived path
          and signed by the author's key.
        </p>
        <p>
          Indexers can present the latest revision as the "current" version while preserving access to all prior versions.
        </p>
      </>
    ),
  },
  {
    category: 'mechanism',
    question: 'How do curator collections and numbering work?',
    answer: (
      <>
        <p>
          A curator publishes a feed object on their own homeserver. The feed defines filters
          (which tags to include, whose reviews to count, sort order). Specs that match the filter
          appear in the collection. The collection is an opinion about which specs matter,
          expressed as data rather than as an editorial merge decision.
        </p>
        <p>
          Numbering is currently a naming convention within a collection ("this collection's first entry,"
          "this collection's second entry"). Formal alias support — where a curator assigns a persistent
          label like "BIP-341" to a specific spec URI — is a planned extension.
        </p>
        <p>
          Multiple curators can maintain competing collections with different inclusion criteria.
          A spec can appear in many collections or none. Inclusion in a collection does not change the spec itself.
        </p>
      </>
    ),
  },

  // --- TRUST: How do I know what to trust? ---
  {
    category: 'trust',
    question: 'How are reviewer groups like "conservative" or "implementers" established?',
    answer: (
      <>
        <p>
          Groups are not declared by an admin. They form from the semantic social graph through
          three mechanisms:
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>Profile tagging.</strong> Users tag other users' profiles with labels like
            {' '}<code className="text-xs bg-surface-2 px-1 rounded">conservative</code>,
            {' '}<code className="text-xs bg-surface-2 px-1 rounded">wallet-expert</code>, or
            {' '}<code className="text-xs bg-surface-2 px-1 rounded">researcher</code>.
            A reviewer group like "Stability-focused" means: reviewers whose profiles have been
            tagged <code className="text-xs bg-surface-2 px-1 rounded">conservative</code> by
            people in your trust graph. Different users may classify the same reviewer differently —
            and that is fine. Your view reflects your graph, not a global authority.
          </li>
          <li>
            <strong>Named lists.</strong> A curator publishes a specific list of public keys:
            "BIP Editors as of March 2026" containing the keys of murchandamus, kanzure, and jonatack.
            Anyone can verify this against the GitHub repo's CODEOWNERS file. Anyone can publish
            a competing list. You choose whose list to trust.
          </li>
          <li>
            <strong>Activity-based.</strong> Anyone who has published a review tag on any spec is
            automatically a reviewer. You do not apply for the role. You earn it by participating.
            Grouping by topic (e.g. "people who have reviewed wallet specs") follows from their
            review history.
          </li>
        </ol>
        <p>
          The key property: no one person or system assigns roles. Groups are emergent
          from actions and opinions in the graph. Different viewers may see different
          groups depending on whose tagging they trust.
        </p>
      </>
    ),
  },
  {
    category: 'trust',
    question: 'If anyone can publish, how do I find the good proposals?',
    answer: (
      <>
        <p>
          Discoverability is separated from publication. You find good proposals the same way you find
          good information in any decentralized system: through trust relationships.
        </p>
        <p>Concretely, the registry offers three filtering mechanisms:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            <strong>Tag-based filtering.</strong> You filter to specs tagged{' '}
            <code className="text-xs bg-surface-2 px-1 rounded">spec-proposal</code>. Noise that isn't
            tagged as a spec doesn't appear.
          </li>
          <li>
            <strong>Reviewer filtering.</strong> You choose whose reviews you trust. If you trust five
            specific reviewers, the registry shows only their tags on each spec. A spec with zero reviews
            from your trusted set is visible but marked as unreviewed by your criteria.
          </li>
          <li>
            <strong>Curator collections.</strong> You subscribe to a curator's collection. The curator
            has already filtered based on their criteria. You see their view.
          </li>
        </ol>
        <p>
          The crucial difference: none of these filters delete the underlying spec. They change your view.
          You can always widen the filter and see everything.
        </p>
      </>
    ),
  },
  {
    category: 'trust',
    question: 'How is Sybil resistance handled? Can someone create 1000 fake reviewer keys to inflate support?',
    answer: (
      <>
        <p>
          This is a real concern and the answer is layered:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Trust filtering is the first defense.</strong> If you only trust reviews from five
            specific keys, a thousand Sybil keys contribute nothing to your view. The attacker has to
            compromise keys you already trust, which is a fundamentally harder problem.
          </li>
          <li>
            <strong>Graph embeddedness matters.</strong> In the Pubky semantic social graph, a key that
            nobody follows, nobody tags, and nobody interacts with has zero graph distance to anyone.
            It is structurally invisible to anyone using trust-path-based filtering. Creating a key is
            free; creating a key that other real people trust is expensive.
          </li>
          <li>
            <strong>Indexers can apply heuristics.</strong> An indexer can weight reviews by the
            reviewer's graph embeddedness, account age, or activity history — similar to how search
            engines weight links. This is not censorship; it is ranked presentation. The raw data
            remains accessible.
          </li>
          <li>
            <strong>"All reviews" view exists as an audit.</strong> The unfiltered view always shows
            every tag, so Sybil activity is visible rather than hidden. Transparency is a feature.
          </li>
        </ul>
        <p>
          No system eliminates Sybil attacks entirely. The goal is to make them visible and ineffective
          against users who exercise meaningful trust selection.
        </p>
      </>
    ),
  },
  {
    category: 'trust',
    question: 'How do I determine consensus on a proposal?',
    answer: (
      <>
        <p>
          You don't determine consensus from a website. That is the entire point.
        </p>
        <p>
          Consensus on a Bitcoin protocol change is determined by what software the ecosystem runs,
          what miners enforce, what nodes validate, and what economic actors accept. No webpage has ever
          decided that. The BIP repository's own BIP 3 says: "No formal or informal decision body governs
          Bitcoin development or decides adoption of BIPs."
        </p>
        <p>
          What a registry <em>can</em> do is surface evidence:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Which implementations exist (attestation data)</li>
          <li>Which reviewers endorse or reject (tag data)</li>
          <li>Which curators include the spec in their collections</li>
          <li>Whether deployments exist in production</li>
        </ul>
        <p>
          You observe consensus. You do not infer it from a merge button.
        </p>
      </>
    ),
  },
  {
    category: 'trust',
    question: 'What stops someone from publishing malicious or harmful content as a "spec"?',
    answer: (
      <>
        <p>
          Publication is open, but discoverability is layered. The same filtering that handles
          low-quality content handles abuse:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Indexers can apply content policies. An indexer's editorial discretion applies to its
            own index, not to the underlying data.
          </li>
          <li>
            Curator collections exclude it. If no curator includes harmful content, it does not appear
            in any curated view.
          </li>
          <li>
            Trust filters scope visibility. Unreviewed or untagged content is deprioritized by default.
          </li>
        </ul>
        <p>
          Filtering at the view layer means multiple communities can apply different moderation
          standards without needing to agree on a single policy.
        </p>
      </>
    ),
  },

  // --- MIGRATION: How does this relate to existing BIPs? ---
  {
    category: 'migration',
    question: 'How does the GitHub mirror work? Does the BIP repo need to change?',
    answer: (
      <>
        <p>
          The BIP repository does not need to change at all. A sync script watches{' '}
          <code className="text-xs bg-surface-2 px-1 rounded">bitcoin/bips</code> and mirrors its content
          into Pubky homeservers automatically:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Merged BIP files are parsed (preamble headers, abstract, body) and published as PubkyAppPost objects.</li>
          <li>Open and closed PRs labeled "New BIP" are mirrored regardless of merge status.</li>
          <li>PR comments containing ACK/NACK/Concept ACK signals are extracted as review tags.</li>
        </ul>
        <p>
          The mirror runs under its own Pubky identity (<code className="text-xs bg-surface-2 px-1 rounded">pk:bip-mirror</code>).
          The GitHub repo becomes one data source among potentially many. Authors who publish directly
          to their own homeservers appear alongside mirrored BIPs in the same registry.
        </p>
        <p>
          Nobody needs permission. Nobody needs to change their workflow. The existing process continues
          exactly as it is. This system adds a view layer on top of it.
        </p>
      </>
    ),
  },
  {
    category: 'migration',
    question: 'Is this trying to replace the BIP repository?',
    answer: (
      <>
        <p>
          No. The existing BIP repository will continue to exist and serve its function. This system
          provides an alternative architecture that separates the roles currently bundled together
          in a single GitHub repository.
        </p>
        <p>
          The two can coexist. A spec can be submitted as both a BIP PR and a Pubky spec. Reviews
          here do not affect the BIP editors' decisions, and BIP editor decisions do not erase
          specs published here.
        </p>
        <p>
          If this model proves useful, it demonstrates a pattern. If it doesn't, nothing has been
          taken away from the existing process.
        </p>
      </>
    ),
  },
  {
    category: 'migration',
    question: 'How do existing BIP numbers map to this?',
    answer: (
      <>
        <p>
          Existing BIP numbers are curator-assigned labels. In this system, a curator could publish
          a collection called "Bitcoin BIPs" and assign alias labels to specs (e.g., label a spec as
          "341" in the "BIP" namespace). That label is a convenience tag, not an intrinsic property
          of the spec.
        </p>
        <p>
          A spec's canonical identity is its URI — the author's public key plus the post path. Numbers
          are overlays. Multiple curators can assign different numbers to the same spec, or the same
          number in different namespaces.
        </p>
        <p>
          For backward compatibility, the registry could import existing BIP text (which is public domain
          or permissively licensed) as Pubky posts and tag them with their existing BIP numbers.
          This preserves the numbering while demonstrating the decoupled model.
        </p>
      </>
    ),
  },
  {
    category: 'migration',
    question: 'Do I need to install anything to use this?',
    answer: (
      <>
        <p>
          To browse: no. The registry is a web application. You open it in a browser and read specs,
          reviews, and collections.
        </p>
        <p>
          To publish a spec or review: you need a Pubky identity (an Ed25519 keypair) and a homeserver.
          The simplest path is to install Pubky Ring (a mobile app for key management), which handles
          identity creation and app authorization. You scan a QR code to authenticate with the registry,
          then publish from the browser.
        </p>
        <p>
          To run your own indexer: clone the Nexus repo and run it. It is open source and uses Docker
          for deployment.
        </p>
      </>
    ),
  },
  {
    category: 'migration',
    question: 'Can I verify the data independently? Can I run everything locally?',
    answer: (
      <>
        <p>
          Yes. Every piece of data in this system is independently verifiable:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Specs</strong>: fetch the URI directly from the author's homeserver. The path is
            deterministic from the author's public key.
          </li>
          <li>
            <strong>Reviews</strong>: fetch the tag from the reviewer's homeserver. The tag's
            existence under the reviewer's key namespace proves authorship.
          </li>
          <li>
            <strong>Identity</strong>: resolve the public key via PKARR on the Mainline DHT.
            No certificate authority or DNS registrar involved.
          </li>
        </ul>
        <p>
          You can run a local Pubky homeserver, a local Nexus indexer, and a local copy of this frontend.
          The entire stack is open source. The Mainline DHT is the only shared dependency, and it is a
          public, permissionless network with millions of nodes.
        </p>
      </>
    ),
  },

  // --- OBJECTIONS: Why not just...? ---
  {
    category: 'objection',
    question: 'How is this different from just using a different GitHub org?',
    answer: (
      <>
        <p>
          GitHub is excellent for collaborative development. The limitation is structural, not
          a flaw in GitHub: a repository concentrates publication, review, and editorial authority
          in one place. Moving to a different org replicates that structure.
        </p>
        <p>
          This system separates those roles architecturally:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Publication does not require merge access. The author places data on their own server.</li>
          <li>A closed PR here does not remove the proposal. The spec persists at its URI independently.</li>
          <li>Reviews are structured, signed objects — not unstructured comments tied to a PR lifecycle.</li>
          <li>Multiple editorial views can coexist without requiring one org to accommodate all perspectives.</li>
        </ul>
      </>
    ),
  },
  {
    category: 'objection',
    question: 'Doesn\'t this just move the editorial role to indexers?',
    answer: (
      <>
        <p>
          Indexers do play a curatorial role, but with structurally less concentration than a single repository:
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>Indexers are substitutable.</strong> Anyone can run one. If an indexer's editorial
            choices don't serve you, you switch or run your own. The underlying data is unchanged.
          </li>
          <li>
            <strong>Indexers read, not write.</strong> An indexer aggregates data from homeservers.
            It does not host the authoritative copy. Choosing a different indexer does not affect
            the spec or its reviews.
          </li>
          <li>
            <strong>Indexers compete on quality.</strong> A good indexer earns usage by surfacing
            relevant content well. This creates healthy pressure toward better curation rather than
            a single point of editorial authority.
          </li>
        </ol>
        <p>
          Indexers can and should have editorial perspectives. The difference is that switching
          indexers is easy, while switching canonical repositories is a coordination problem.
        </p>
      </>
    ),
  },
  {
    category: 'objection',
    question: 'Editors already do useful quality filtering. Does this undermine that?',
    answer: (
      <>
        <p>
          Not at all. Expert filtering is essential. This system makes expert judgment <em>more</em> visible
          and <em>more</em> valuable, not less.
        </p>
        <p>
          The difference is where in the stack filtering happens:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Publication</strong> is open. Anyone can submit a spec. This reduces the editorial
            burden of deciding what gets to exist.
          </li>
          <li>
            <strong>Quality filtering</strong> happens through signed reviews, curated collections, and
            trust presets. A well-known editor's "approved" collection carries enormous weight precisely
            because their reputation is at stake.
          </li>
        </ul>
        <p>
          An ACK from a respected expert is a stronger signal in this model because it is a signed,
          independent, unforgeable object — not a comment in a thread that might get lost. Expert
          review is elevated, not diminished. The editors gain better tools; they do not lose their voice.
        </p>
      </>
    ),
  },
  {
    category: 'objection',
    question: 'This is a lot of infrastructure for a problem that affects maybe 20 people a year.',
    answer: (
      <>
        <p>
          The BIP process touches 20 people directly but signals to the entire Bitcoin ecosystem
          what is legitimate, what is fringe, and what is real. That signaling function has
          outsized influence relative to the number of PR authors.
        </p>
        <p>
          But the more important point: this is not purpose-built infrastructure for BIPs. It is
          the general Pubky stack — homeservers, tags, feeds, indexers, key-based identity — applied
          to a specific domain. The same primitives already power a social media application,
          a content playground, and a semantic social graph. The spec registry is another view
          of the same graph, not a new system.
        </p>
        <p>
          If this works for specs, the same pattern works for NIPs, RFCs, grant reviews, moderation
          policies, or any contested document archive. The infrastructure investment is shared across
          all of those use cases.
        </p>
      </>
    ),
  },
  {
    category: 'objection',
    question: 'Why would anyone use this instead of just posting their spec on their own website?',
    answer: (
      <>
        <p>
          You can post a spec on your own website today. The problem isn't hosting. It's three things
          a personal website doesn't give you:
        </p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            <strong>Structured review.</strong> A spec on your website gets unstructured email or tweet
            responses. Here, reviews are signed, tagged by stance, filterable, and aggregatable across
            many reviewers.
          </li>
          <li>
            <strong>Discoverability through trust.</strong> A spec on your website is only found if
            someone already knows to look. Here, a spec can surface through tag-based search, curator
            collections, and reviewer activity — without requiring one central repo to bless it.
          </li>
          <li>
            <strong>Comparability.</strong> Readers can compare how different reviewer groups judge
            the same spec. That comparison is the product. A personal website doesn't offer it.
          </li>
        </ol>
      </>
    ),
  },
]

const CATEGORIES: { id: FAQEntry['category']; title: string; description: string }[] = [
  { id: 'mechanism', title: 'How it works', description: 'The technical mechanics of publication, review, hosting, and discovery.' },
  { id: 'trust', title: 'Trust and filtering', description: 'How you find good proposals, handle spam, and assess consensus.' },
  { id: 'migration', title: 'Compatibility', description: 'How this relates to existing BIPs, tooling, and workflows.' },
  { id: 'objection', title: 'Objections', description: 'Honest answers to "why not just...?" questions.' },
]

export default function FAQ() {
  const [openId, setOpenId] = useState<number | null>(null)

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold leading-tight mb-4">
          How Does This Actually Work?
        </h1>
        <p className="text-text-secondary leading-relaxed">
          The hard questions a protocol developer would ask, answered with concrete mechanism details.
        </p>
      </header>

      <div className="space-y-10">
        {CATEGORIES.map(cat => {
          const items = FAQS.filter(f => f.category === cat.id)
          return (
            <section key={cat.id}>
              <div className="mb-4">
                <h2 className="font-display text-lg font-semibold">{cat.title}</h2>
                <p className="text-sm text-text-tertiary">{cat.description}</p>
              </div>
              <div className="space-y-2">
                {items.map((faq, idx) => {
                  const globalIdx = FAQS.indexOf(faq)
                  const isOpen = openId === globalIdx

                  return (
                    <div
                      key={globalIdx}
                      className="border border-border rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenId(isOpen ? null : globalIdx)}
                        className="w-full flex items-start gap-3 p-4 text-left hover:bg-surface transition-colors"
                      >
                        <span className={cn(
                          'mt-0.5 text-sm transition-transform flex-shrink-0',
                          isOpen && 'rotate-90'
                        )}>
                          &#9654;
                        </span>
                        <span className="text-[0.925rem] font-medium text-text-primary leading-snug">
                          {faq.question}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pl-10 space-y-3 text-[0.875rem] text-text-secondary leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      <div className="border-t border-border pt-8 mt-10 flex justify-center gap-3">
        <Link
          href="/bip"
          className="px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          Try the Demo
        </Link>
        <Link
          href="/about"
          className="px-5 py-2.5 bg-surface-2 text-text-secondary rounded-lg text-sm font-medium border border-border hover:text-text-primary hover:bg-surface-3 transition-colors"
        >
          Technical Spec
        </Link>
        <Link
          href="/learn"
          className="px-5 py-2.5 bg-surface-2 text-text-secondary rounded-lg text-sm font-medium border border-border hover:text-text-primary hover:bg-surface-3 transition-colors"
        >
          Read the Argument
        </Link>
      </div>
    </div>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-3 font-mono text-xs text-text-secondary overflow-x-auto">
      {children}
    </div>
  )
}

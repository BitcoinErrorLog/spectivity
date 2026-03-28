import type { Spec, Reviewer, Review, Attestation, CuratorCollection, TrustPreset, ReviewStance, SpecSource } from './types'

// Helper for mock data: namespace defaults to 'bip' for existing mock entries

// --- Reviewers ---

export const reviewers: Reviewer[] = [
  {
    pubky: 'pk:conservative-maintainer',
    name: 'Marcus Stern',
    bio: 'Long-time core maintainer. Focused on minimal changes and backward compatibility. Reviews should protect stability above all else.',
    role: 'Core Maintainer',
    expertise: ['consensus', 'p2p', 'backward-compatibility'],
    image: undefined,
  },
  {
    pubky: 'pk:wallet-standards-editor',
    name: 'Keiko Tanaka',
    bio: 'Wallet interoperability researcher. If your spec breaks HD wallets or key derivation, expect a thorough nack.',
    role: 'Wallet Standards Editor',
    expertise: ['wallet', 'key-derivation', 'bip32', 'interoperability'],
    image: undefined,
  },
  {
    pubky: 'pk:experimental-researcher',
    name: 'Davi Rocha',
    bio: 'Protocol researcher exploring covenants, new opcodes, and non-standard transaction structures. Novelty is not a defect.',
    role: 'Experimental Researcher',
    expertise: ['covenants', 'opcodes', 'script', 'research'],
    image: undefined,
  },
  {
    pubky: 'pk:merchant-builder',
    name: 'Anya Petrova',
    bio: 'Building merchant tooling since 2019. Reviews from the perspective of people accepting bitcoin in the real world.',
    role: 'Merchant Tooling Builder',
    expertise: ['merchant', 'payments', 'lightning', 'point-of-sale'],
    image: undefined,
  },
  {
    pubky: 'pk:deployment-operator',
    name: 'Chen Wei',
    bio: 'Running Bitcoin infrastructure at scale. Focused on deployment risk, node resource usage, and operational feasibility.',
    role: 'Deployment Operator',
    expertise: ['infrastructure', 'deployment', 'performance', 'nodes'],
    image: undefined,
  },
  {
    pubky: 'pk:minimalist-reviewer',
    name: 'Elias Rook',
    bio: 'Less is more. Every new feature is a new attack surface. Strong preference for proposals that simplify rather than extend.',
    role: 'Minimalist Reviewer',
    expertise: ['security', 'simplicity', 'attack-surface'],
    image: undefined,
  },
  {
    pubky: 'pk:documentation-purist',
    name: 'Sasha Orlov',
    bio: 'Technical writer and spec editor. A proposal that cannot be clearly specified cannot be safely implemented.',
    role: 'Documentation Purist',
    expertise: ['specification', 'documentation', 'clarity', 'test-vectors'],
    image: undefined,
  },
  {
    pubky: 'pk:historical-librarian',
    name: 'Noor Abubakar',
    bio: 'Archivist of Bitcoin protocol history. Context matters. Many "new" ideas were proposed and rejected for good reasons a decade ago.',
    role: 'Historical Librarian',
    expertise: ['history', 'precedent', 'archive', 'context'],
    image: undefined,
  },
]

// --- Specs ---

export const specs: Spec[] = [
  {
    id: 'spec-ordinal-indexing',
    namespace: 'bip',
    authorPubky: 'pk:casey-rodarmor',
    uri: 'pubky://pk:casey-rodarmor/pub/pubky.app/posts/spec-ordinal-indexing',
    title: 'Ordinal Numbers: A Deterministic Satoshi Indexing Scheme',
    summary: 'Defines a scheme for numbering and tracking individual satoshis across Bitcoin transactions, enabling a deterministic ordering based on mining and transfer history.',
    body: `## Abstract

This document defines ordinal numbers, a scheme for numbering satoshis, and ordinal theory, a framework for reasoning about and interacting with individual satoshis.

Satoshis are numbered in the order in which they are mined, and transferred from transaction inputs to transaction outputs in first-in-first-out order. Ordinal numbers can be used as a stable identifier for digital artifacts that are inscribed on-chain.

## Motivation

Bitcoin has no native concept of a stable identifier for individual satoshis. Ordinal theory provides such a concept, enabling applications that track, transfer, and collect individual satoshis and inscriptions attached to them.

This has implications for digital collectibles, provenance tracking, and new forms of on-chain expression. The protocol operates entirely within existing consensus rules and requires no changes to Bitcoin.

## Specification

Ordinal numbers are assigned to satoshis in the order in which they are mined. The first satoshi in the first block has ordinal number 0, the second has ordinal number 1, and so on.

Satoshis transfer from transaction inputs to outputs in first-in-first-out order. If a transaction has inputs with ordinals [0, 1, 2] and creates outputs of size 1 and 2, the first output receives ordinal 0 and the second receives ordinals 1 and 2.

This creates a deterministic, consensus-compatible numbering system that can be independently verified by any node.`,
    typeLabel: 'informational',
    topicTags: ['indexing', 'satoshi', 'ordinals', 'digital-artifacts'],
    createdAt: '2023-01-20T23:46:13Z',
    updatedAt: '2025-09-23T00:59:00Z',
    revisionUris: [],
    discussionLinks: ['https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2022-February/019975.html'],
    source: 'rejected-pr' as SpecSource,
    sourceUrl: 'https://github.com/bitcoin/bips/pull/1408',
    prNumber: 1408,
    githubAuthor: 'casey',
    specNumber: undefined,
  },
  {
    id: 'spec-psbt-v2',
    namespace: 'bip',
    authorPubky: 'pk:andrew-chow',
    uri: 'pubky://pk:andrew-chow/pub/pubky.app/posts/spec-psbt-v2',
    title: 'PSBT Version 2: Partially Signed Bitcoin Transactions',
    summary: 'Extends the PSBT format (BIP 174) with a version 2 that enables a more flexible transaction construction workflow, supporting interactive multi-party signing protocols.',
    body: `## Abstract

This document proposes a new version of the Partially Signed Bitcoin Transaction (PSBT) format. PSBT v2 restructures how transaction data is represented to enable a more flexible construction workflow.

## Motivation

PSBT v0 requires the unsigned transaction to be set at creation time. This restricts the workflow and prevents certain multi-party protocols where inputs and outputs are added incrementally by different participants.

PSBT v2 resolves this by removing the global unsigned transaction and instead distributing transaction data across per-input and per-output maps. This allows inputs and outputs to be added independently and in any order.

## Specification

PSBT v2 introduces the PSBT_GLOBAL_TX_VERSION, PSBT_GLOBAL_FALLBACK_LOCKTIME, PSBT_GLOBAL_INPUT_COUNT, and PSBT_GLOBAL_OUTPUT_COUNT global fields. Per-input fields include PSBT_IN_PREVIOUS_TXID, PSBT_IN_OUTPUT_INDEX, and PSBT_IN_SEQUENCE. Per-output fields include PSBT_OUT_AMOUNT and PSBT_OUT_SCRIPT.

A Constructor role is introduced that can add and remove inputs and outputs. Once all parties agree on the transaction structure, the Constructor sets the PSBT_GLOBAL_TX_MODIFIABLE field to indicate that no further changes should be made.`,
    typeLabel: 'specification',
    topicTags: ['wallet', 'psbt', 'signing', 'multi-party'],
    createdAt: '2024-06-15T10:00:00Z',
    updatedAt: '2025-11-01T08:30:00Z',
    revisionUris: [],
    discussionLinks: [],
    source: 'merged' as SpecSource,
    sourceUrl: 'https://github.com/bitcoin/bips/blob/master/bip-0370.mediawiki',
    specNumber: 370,
    githubAuthor: 'achow101',
  },
  {
    id: 'spec-silent-payments',
    namespace: 'bip',
    authorPubky: 'pk:josie-baker',
    uri: 'pubky://pk:josie-baker/pub/pubky.app/posts/spec-silent-payments',
    title: 'Silent Payments: Reusable Payment Codes Without On-Chain Linkability',
    summary: 'Defines a protocol for generating unique addresses from a single public payment code, enabling private, reusable payment endpoints without requiring interaction between sender and receiver.',
    body: `## Abstract

Silent payments allow a receiver to publish a single static payment code from which senders can derive unique, unlinkable on-chain addresses. This eliminates the need for address reuse while maintaining a simple, non-interactive payment flow.

## Motivation

Address reuse is one of the most common privacy failures in Bitcoin. Existing solutions like BIP 47 payment codes require an on-chain notification transaction, adding cost and a metadata link. Stealth address schemes proposed previously were complex and never widely adopted.

Silent payments achieve the same goal with no notification transaction, no interaction, and no on-chain link between the payment code and the addresses derived from it. The sender uses the receiver's payment code combined with their own input keys to derive a unique output address that only the receiver can detect and spend.

## Specification

The receiver publishes a silent payment address consisting of a scan key and a spend key. The sender computes a shared secret using ECDH between the sum of their input private keys and the receiver's scan key. The output address is derived by tweaking the receiver's spend key with the shared secret.

The receiver scans each transaction by computing the same shared secret using each transaction's input public keys. If a match is found, the receiver can derive the private key to spend that output.`,
    typeLabel: 'specification',
    topicTags: ['privacy', 'payments', 'addresses', 'stealth'],
    createdAt: '2024-03-10T14:00:00Z',
    updatedAt: '2026-01-15T09:00:00Z',
    revisionUris: [],
    discussionLinks: [],
    source: 'merged' as SpecSource,
    sourceUrl: 'https://github.com/bitcoin/bips/blob/master/bip-0352.mediawiki',
    specNumber: 352,
    githubAuthor: 'josibake',
  },
  {
    id: 'spec-op-cat',
    namespace: 'bip',
    authorPubky: 'pk:ethan-heilman',
    uri: 'pubky://pk:ethan-heilman/pub/pubky.app/posts/spec-op-cat',
    title: 'OP_CAT: Re-enable Concatenation in Bitcoin Script',
    summary: 'Proposes re-enabling the OP_CAT opcode in Bitcoin Script via a soft fork, allowing script-level byte string concatenation to support covenants, vaults, and other advanced constructions.',
    body: `## Abstract

This proposal re-enables OP_CAT in tapscript. OP_CAT takes two byte strings from the stack, concatenates them, and pushes the result. The opcode was originally part of Bitcoin but was disabled by Satoshi Nakamoto in 2010 due to concerns about memory exhaustion attacks.

## Motivation

OP_CAT is a simple, well-understood opcode that enables a wide range of useful constructions when combined with existing opcodes. These include tree signatures, Lamport signatures for quantum resistance, covenants, vaults, and general-purpose computation verification.

The original concerns about memory exhaustion are addressed by tapscript's stack element size limit of 520 bytes, which prevents the exponential blowup that motivated the original removal.

## Specification

OP_CAT pops two elements from the stack, concatenates them with the first-popped element at the end, and pushes the result. If the resulting element exceeds 520 bytes, the script fails. OP_CAT is assigned opcode number 126 (0x7e) and is only enabled in tapscript (witness version 1, leaf version 0xc0).`,
    typeLabel: 'specification',
    topicTags: ['consensus', 'opcodes', 'covenants', 'soft-fork'],
    createdAt: '2023-10-21T16:00:00Z',
    updatedAt: '2026-02-20T11:00:00Z',
    revisionUris: [],
    discussionLinks: [],
    source: 'open-pr' as SpecSource,
    sourceUrl: 'https://github.com/bitcoin/bips/pull/1525',
    prNumber: 1525,
    specNumber: undefined,
    githubAuthor: 'EthanHeilman',
  },
  {
    id: 'spec-bolt12',
    namespace: 'bolt',
    authorPubky: 'pk:rusty-russell',
    uri: 'pubky://pk:rusty-russell/pub/pubky.app/posts/spec-bolt12',
    title: 'BOLT 12: Offers Protocol for Lightning Network',
    summary: 'Defines an offer-based payment flow for Lightning that replaces static invoices with reusable, privacy-preserving payment endpoints that support recurring payments and refunds.',
    body: `## Abstract

BOLT 12 introduces the concept of offers to the Lightning Network. An offer is a static, reusable payment endpoint that a receiver can publish. When a sender scans or opens an offer, their node requests a fresh invoice over an onion-routed message. This eliminates the need for single-use invoices for common payment flows.

## Motivation

BOLT 11 invoices are single-use by design: each invoice commits to a specific payment hash and amount. This creates friction for recurring payments, donations, point-of-sale, and any scenario where a receiver wants to publish one stable payment endpoint.

BOLT 12 solves this by separating the offer (what you publish) from the invoice (what you pay). Offers contain the receiver's node identity and payment terms but not a specific payment hash. The actual invoice is fetched interactively over onion messages, preserving sender and receiver privacy.

## Specification

An offer is a bech32m-encoded string starting with "lno" containing a node identity, optional description, optional amount, and optional metadata. The sender's node sends an invoice_request onion message to the offer's node. The receiver responds with an invoice onion message containing a fresh payment hash, amount, and payment path hints.`,
    typeLabel: 'specification',
    topicTags: ['lightning', 'payments', 'invoices', 'privacy'],
    createdAt: '2024-08-01T12:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
    revisionUris: [],
    discussionLinks: [],
    source: 'merged' as SpecSource,
    sourceUrl: 'https://github.com/lightning/bolts/pull/798',
    specNumber: 12,
    githubAuthor: 'rustyrussell',
  },
]

// --- Reviews ---

export const reviews: Review[] = [
  // Ordinals reviews
  { id: 'rev-001', specId: 'spec-ordinal-indexing', reviewerPubky: 'pk:conservative-maintainer', label: 'nack', createdAt: 1676400000000 },
  { id: 'rev-002', specId: 'spec-ordinal-indexing', reviewerPubky: 'pk:wallet-standards-editor', label: 'needs-work', createdAt: 1676500000000 },
  { id: 'rev-003', specId: 'spec-ordinal-indexing', reviewerPubky: 'pk:experimental-researcher', label: 'concept-ack', createdAt: 1676600000000 },
  { id: 'rev-004', specId: 'spec-ordinal-indexing', reviewerPubky: 'pk:merchant-builder', label: 'ack', createdAt: 1676700000000 },
  { id: 'rev-005', specId: 'spec-ordinal-indexing', reviewerPubky: 'pk:deployment-operator', label: 'deployment-risk', createdAt: 1676800000000 },
  { id: 'rev-006', specId: 'spec-ordinal-indexing', reviewerPubky: 'pk:minimalist-reviewer', label: 'nack', createdAt: 1676900000000 },
  { id: 'rev-007', specId: 'spec-ordinal-indexing', reviewerPubky: 'pk:documentation-purist', label: 'needs-work', createdAt: 1677000000000 },
  { id: 'rev-008', specId: 'spec-ordinal-indexing', reviewerPubky: 'pk:historical-librarian', label: 'concept-ack', createdAt: 1677100000000 },

  // PSBT v2 reviews
  { id: 'rev-009', specId: 'spec-psbt-v2', reviewerPubky: 'pk:conservative-maintainer', label: 'ack', createdAt: 1718500000000 },
  { id: 'rev-010', specId: 'spec-psbt-v2', reviewerPubky: 'pk:wallet-standards-editor', label: 'ack', createdAt: 1718600000000 },
  { id: 'rev-011', specId: 'spec-psbt-v2', reviewerPubky: 'pk:documentation-purist', label: 'ack', createdAt: 1718700000000 },
  { id: 'rev-012', specId: 'spec-psbt-v2', reviewerPubky: 'pk:minimalist-reviewer', label: 'concept-ack', createdAt: 1718800000000 },

  // Silent Payments reviews
  { id: 'rev-013', specId: 'spec-silent-payments', reviewerPubky: 'pk:conservative-maintainer', label: 'concept-ack', createdAt: 1710100000000 },
  { id: 'rev-014', specId: 'spec-silent-payments', reviewerPubky: 'pk:wallet-standards-editor', label: 'ack', createdAt: 1710200000000 },
  { id: 'rev-015', specId: 'spec-silent-payments', reviewerPubky: 'pk:experimental-researcher', label: 'ack', createdAt: 1710300000000 },
  { id: 'rev-016', specId: 'spec-silent-payments', reviewerPubky: 'pk:deployment-operator', label: 'deployment-risk', createdAt: 1710400000000 },
  { id: 'rev-017', specId: 'spec-silent-payments', reviewerPubky: 'pk:minimalist-reviewer', label: 'needs-work', createdAt: 1710500000000 },

  // OP_CAT reviews
  { id: 'rev-018', specId: 'spec-op-cat', reviewerPubky: 'pk:conservative-maintainer', label: 'nack', createdAt: 1697900000000 },
  { id: 'rev-019', specId: 'spec-op-cat', reviewerPubky: 'pk:experimental-researcher', label: 'ack', createdAt: 1698000000000 },
  { id: 'rev-020', specId: 'spec-op-cat', reviewerPubky: 'pk:minimalist-reviewer', label: 'concept-ack', createdAt: 1698100000000 },
  { id: 'rev-021', specId: 'spec-op-cat', reviewerPubky: 'pk:deployment-operator', label: 'needs-work', createdAt: 1698200000000 },
  { id: 'rev-022', specId: 'spec-op-cat', reviewerPubky: 'pk:historical-librarian', label: 'ack', createdAt: 1698300000000 },

  // BOLT 12 reviews
  { id: 'rev-023', specId: 'spec-bolt12', reviewerPubky: 'pk:merchant-builder', label: 'ack', createdAt: 1722500000000 },
  { id: 'rev-024', specId: 'spec-bolt12', reviewerPubky: 'pk:wallet-standards-editor', label: 'ack', createdAt: 1722600000000 },
  { id: 'rev-025', specId: 'spec-bolt12', reviewerPubky: 'pk:deployment-operator', label: 'ack', createdAt: 1722700000000 },
  { id: 'rev-026', specId: 'spec-bolt12', reviewerPubky: 'pk:documentation-purist', label: 'needs-work', createdAt: 1722800000000 },
]

// --- Attestations ---

export const attestations: Attestation[] = [
  { id: 'att-001', specId: 'spec-ordinal-indexing', attestorPubky: 'pk:merchant-builder', attestationType: 'implemented', subject: 'ord indexer', evidenceLink: 'https://github.com/ordinals/ord', statement: 'Reference implementation with full indexing and wallet support.', createdAt: '2023-06-01T00:00:00Z' },
  { id: 'att-002', specId: 'spec-ordinal-indexing', attestorPubky: 'pk:deployment-operator', attestationType: 'deployed', subject: 'ordinals.com', evidenceLink: 'https://ordinals.com', statement: 'Block explorer and inscription viewer running in production.', createdAt: '2023-03-01T00:00:00Z' },
  { id: 'att-003', specId: 'spec-ordinal-indexing', attestorPubky: 'pk:experimental-researcher', attestationType: 'implemented', subject: 'ord-js', evidenceLink: 'https://github.com/example/ord-js', statement: 'Independent JavaScript implementation of ordinal tracking.', createdAt: '2024-01-15T00:00:00Z' },
  { id: 'att-004', specId: 'spec-psbt-v2', attestorPubky: 'pk:wallet-standards-editor', attestationType: 'implemented', subject: 'Bitcoin Core', evidenceLink: 'https://github.com/bitcoin/bitcoin', statement: 'PSBT v2 support merged into Bitcoin Core.', createdAt: '2025-06-01T00:00:00Z' },
  { id: 'att-005', specId: 'spec-silent-payments', attestorPubky: 'pk:wallet-standards-editor', attestationType: 'in-progress', subject: 'Bitcoin Core PR', evidenceLink: 'https://github.com/bitcoin/bitcoin/pull/28122', statement: 'Silent payments implementation under review in Bitcoin Core.', createdAt: '2025-09-01T00:00:00Z' },
  { id: 'att-006', specId: 'spec-bolt12', attestorPubky: 'pk:merchant-builder', attestationType: 'deployed', subject: 'CLN', evidenceLink: 'https://github.com/ElementsProject/lightning', statement: 'BOLT 12 offers fully supported in Core Lightning.', createdAt: '2025-11-01T00:00:00Z' },
  { id: 'att-007', specId: 'spec-bolt12', attestorPubky: 'pk:deployment-operator', attestationType: 'implemented', subject: 'LDK', evidenceLink: 'https://github.com/lightningdevkit/rust-lightning', statement: 'BOLT 12 offer creation and payment supported in LDK.', createdAt: '2025-12-01T00:00:00Z' },
]

// --- Curator Collections ---

export const collections: CuratorCollection[] = [
  {
    id: 'col-mature-standards',
    curatorPubky: 'pk:conservative-maintainer',
    title: 'Mature Bitcoin Standards',
    description: 'Specifications that have achieved broad implementation, deployment, and community confidence. The conservative baseline for interoperability.',
    specIds: ['spec-psbt-v2', 'spec-bolt12'],
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'col-wallet-interop',
    curatorPubky: 'pk:wallet-standards-editor',
    title: 'Wallet Interoperability Set',
    description: 'Proposals relevant to wallet developers seeking cross-implementation compatibility.',
    specIds: ['spec-psbt-v2', 'spec-silent-payments', 'spec-bolt12'],
    createdAt: '2025-03-01T00:00:00Z',
  },
  {
    id: 'col-experimental',
    curatorPubky: 'pk:experimental-researcher',
    title: 'Experimental Research Shelf',
    description: 'Proposals pushing the boundaries of what Bitcoin can do. Inclusion means the idea is worth studying, not that it is ready for deployment.',
    specIds: ['spec-ordinal-indexing', 'spec-op-cat', 'spec-silent-payments'],
    createdAt: '2025-02-01T00:00:00Z',
  },
  {
    id: 'col-rejected-interesting',
    curatorPubky: 'pk:historical-librarian',
    title: 'Rejected But Interesting',
    description: 'Proposals that were not accepted by traditional processes but contain ideas worth preserving and studying.',
    specIds: ['spec-ordinal-indexing'],
    createdAt: '2026-03-15T00:00:00Z',
  },
]

// --- Profile Tags (how reviewers get classified) ---
// In production, these are PubkyAppTag objects that other users apply
// to reviewer profiles. E.g., Alice tags Bob's profile with "conservative"
// because she considers his reviews stability-focused.
// The registry reads these tags from the semantic social graph to build groups.

export const profileTags: Record<string, string[]> = {
  'pk:conservative-maintainer': ['conservative', 'core-dev', 'stability'],
  'pk:wallet-standards-editor': ['wallet-expert', 'implementer', 'interoperability'],
  'pk:experimental-researcher': ['researcher', 'experimental', 'covenants'],
  'pk:merchant-builder': ['implementer', 'merchant', 'payments', 'builder'],
  'pk:deployment-operator': ['implementer', 'infrastructure', 'conservative', 'ops'],
  'pk:minimalist-reviewer': ['conservative', 'security', 'minimalist'],
  'pk:documentation-purist': ['documentation', 'specification', 'editorial'],
  'pk:historical-librarian': ['historian', 'researcher', 'context'],
}

// --- Trust Presets ---
// Each preset has criteria explaining HOW its reviewer list is derived.
// In production, the includedReviewers list is computed dynamically from
// the semantic social graph based on the criteria.
// In the demo, the lists are pre-computed from the profileTags above.

function reviewersWithTags(tags: string[]): string[] {
  return Object.entries(profileTags)
    .filter(([, userTags]) => tags.some(t => userTags.includes(t)))
    .map(([pubky]) => pubky)
}

export const trustPresets: TrustPreset[] = [
  {
    id: 'preset-all',
    title: 'All Reviewers',
    description: 'Every reviewer who has tagged any spec. No filtering applied.',
    criteria: { type: 'all' },
    includedReviewers: reviewers.map(r => r.pubky),
    excludedReviewers: [],
  },
  {
    id: 'preset-conservative',
    title: 'Stability-focused',
    description: 'Reviewers tagged "conservative" or "stability" by other users in the graph. These reviewers tend to prioritize backward compatibility and minimal changes.',
    criteria: { type: 'profile-tag', tags: ['conservative', 'stability'], description: 'Reviewers whose profiles are tagged "conservative" or "stability" by trusted users.' },
    includedReviewers: reviewersWithTags(['conservative', 'stability']),
    excludedReviewers: [],
  },
  {
    id: 'preset-implementers',
    title: 'Implementers',
    description: 'Reviewers tagged "implementer" or "builder" — people who write and ship code rather than only reviewing specs.',
    criteria: { type: 'profile-tag', tags: ['implementer', 'builder'], description: 'Reviewers whose profiles are tagged "implementer" or "builder" by trusted users.' },
    includedReviewers: reviewersWithTags(['implementer', 'builder']),
    excludedReviewers: [],
  },
  {
    id: 'preset-researchers',
    title: 'Researchers',
    description: 'Reviewers tagged "researcher" or "experimental" — people focused on exploring new protocol possibilities.',
    criteria: { type: 'profile-tag', tags: ['researcher', 'experimental'], description: 'Reviewers whose profiles are tagged "researcher" or "experimental" by trusted users.' },
    includedReviewers: reviewersWithTags(['researcher', 'experimental']),
    excludedReviewers: [],
  },
  {
    id: 'preset-bip-editors',
    title: 'BIP Editors',
    description: 'The current BIP repository editors, identified by a curated list of known public keys.',
    criteria: { type: 'named-list', curatorPubky: 'pk:bip-mirror', listName: 'BIP Editors (March 2026)', description: 'Specific pubkeys matching the current bitcoin/bips CODEOWNERS. Verifiable against the GitHub repository.' },
    includedReviewers: [],
    excludedReviewers: [],
  },
  {
    id: 'preset-wallet',
    title: 'Wallet experts',
    description: 'Reviewers tagged "wallet-expert" or "interoperability" — focused on wallet UX and key management.',
    criteria: { type: 'profile-tag', tags: ['wallet-expert', 'interoperability'], description: 'Reviewers whose profiles are tagged "wallet-expert" by trusted users.' },
    includedReviewers: reviewersWithTags(['wallet-expert', 'interoperability']),
    excludedReviewers: [],
  },
]

// --- Helper to build author profiles ---

export const authors: Record<string, { name: string; bio: string }> = {
  'pk:casey-rodarmor': { name: 'Casey Rodarmor', bio: 'Creator of Ordinals and Inscriptions.' },
  'pk:andrew-chow': { name: 'Andrew Chow', bio: 'Bitcoin Core developer focused on wallet and PSBT.' },
  'pk:josie-baker': { name: 'Josibake', bio: 'Privacy researcher working on silent payments.' },
  'pk:ethan-heilman': { name: 'Ethan Heilman', bio: 'Cryptography researcher. OP_CAT proponent.' },
  'pk:rusty-russell': { name: 'Rusty Russell', bio: 'Core Lightning developer and BOLT 12 author.' },
}

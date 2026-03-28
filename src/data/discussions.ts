/**
 * Discussion data model and mock data.
 *
 * In production, discussions are PubkyAppPost objects with `parent` pointing
 * to the spec URI or another discussion post URI, tagged with `spec-discussion`.
 */

export interface Discussion {
  id: string
  specId: string
  authorPubky: string
  authorName: string
  parentId?: string
  body: string
  createdAt: string
  updatedAt: string
}

const MOCK_DISCUSSIONS: Discussion[] = [
  {
    id: 'disc-001',
    specId: 'spec-ordinal-indexing',
    authorPubky: 'pk:gh-vostrnad',
    authorName: 'vostrnad',
    body: 'Concept ACK for BIP assignment. While this proposal is controversial, not useful to most users, and argued by some to be outright malicious, these were never reasons to reject a BIP.',
    createdAt: '2023-02-16T00:50:00Z',
    updatedAt: '2023-02-16T00:50:00Z',
  },
  {
    id: 'disc-002',
    specId: 'spec-ordinal-indexing',
    authorPubky: 'pk:gh-kallewoof',
    authorName: 'kallewoof',
    body: 'BIP assignments are not endorsements, merely a way to conveniently refer to various proposals. There have even in the past been proposals that all pull requests are automatically assigned their pull request number, but this has not been embraced yet.',
    createdAt: '2023-02-17T23:23:00Z',
    updatedAt: '2023-02-17T23:23:00Z',
  },
  {
    id: 'disc-003',
    specId: 'spec-ordinal-indexing',
    authorPubky: 'pk:gh-casey',
    authorName: 'casey',
    body: 'I would like to just comment here with my understanding of the BIP process, since there seem to be many misunderstandings. An accepted BIP does not indicate endorsement by the BIP repo maintainers, Bitcoin Core, or the larger Bitcoin community. A BIP is more akin to a form of technical documentation or standard.',
    createdAt: '2023-02-15T08:03:00Z',
    updatedAt: '2023-02-15T08:03:00Z',
  },
  {
    id: 'disc-004',
    specId: 'spec-ordinal-indexing',
    authorPubky: 'pk:gh-michaelfolkson',
    authorName: 'michaelfolkson',
    parentId: 'disc-003',
    body: 'Whether this gets allocated a BIP number or not seems ultimately down to the BIP editors\' discretion to me and whether or not this is going to be used by trolls to waste their time.',
    createdAt: '2023-02-18T14:38:00Z',
    updatedAt: '2023-02-18T14:38:00Z',
  },
  {
    id: 'disc-005',
    specId: 'spec-op-cat',
    authorPubky: 'pk:experimental-researcher',
    authorName: 'Davi Rocha',
    body: 'OP_CAT is one of the simplest opcodes to reason about. The original memory concerns are fully addressed by the 520-byte stack element limit. The range of constructions it enables — tree signatures, Lamport signatures, covenants — makes it one of the highest-value additions per byte of complexity.',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'disc-006',
    specId: 'spec-silent-payments',
    authorPubky: 'pk:wallet-standards-editor',
    authorName: 'Keiko Tanaka',
    body: 'The scanning cost is the main concern for wallet implementers. Full-node wallets can handle it, but SPV-style light clients will need a notification mechanism or a trusted scanning service. This should be documented as a deployment consideration.',
    createdAt: '2024-04-10T14:00:00Z',
    updatedAt: '2024-04-10T14:00:00Z',
  },
]

export function getDiscussionsForSpec(specId: string): Discussion[] {
  return MOCK_DISCUSSIONS.filter(d => d.specId === specId)
}

export function getTopLevelDiscussions(specId: string): Discussion[] {
  return MOCK_DISCUSSIONS.filter(d => d.specId === specId && !d.parentId)
}

export function getReplies(parentId: string): Discussion[] {
  return MOCK_DISCUSSIONS.filter(d => d.parentId === parentId)
}

export function getAllDiscussions(): Discussion[] {
  return MOCK_DISCUSSIONS
}

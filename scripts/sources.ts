/**
 * Registry of spec sources that can be synced.
 * Each source defines how to find, parse, and identify specs from a GitHub repo.
 */

export interface SpecSourceConfig {
  namespace: string
  label: string
  repo: string
  filePattern: RegExp
  numberExtractor: (filename: string) => number | undefined
  prLabels: string[]
  mirrorPubky: string
  subdir?: string
}

export const SOURCES: SpecSourceConfig[] = [
  {
    namespace: 'bip',
    label: 'BIP',
    repo: 'bitcoin/bips',
    filePattern: /^bip-(\d{4})\.(mediawiki|md)$/,
    numberExtractor: (f) => {
      const m = f.match(/bip-(\d{4})/)
      return m ? parseInt(m[1], 10) : undefined
    },
    prLabels: ['New BIP', 'Process'],
    mirrorPubky: 'pk:bip-mirror',
  },
  {
    namespace: 'nip',
    label: 'NIP',
    repo: 'nostr-protocol/nips',
    filePattern: /^(\d{2,3})\.md$/,
    numberExtractor: (f) => {
      const m = f.match(/^(\d{2,3})\.md$/)
      return m ? parseInt(m[1], 10) : undefined
    },
    prLabels: [],
    mirrorPubky: 'pk:nip-mirror',
  },
  {
    namespace: 'bolt',
    label: 'BOLT',
    repo: 'lightning/bolts',
    filePattern: /^(\d{2})-.*\.md$/,
    numberExtractor: (f) => {
      const m = f.match(/^(\d{2})-/)
      return m ? parseInt(m[1], 10) : undefined
    },
    prLabels: [],
    mirrorPubky: 'pk:bolt-mirror',
  },
  {
    namespace: 'bep',
    label: 'BEP',
    repo: 'bittorrent/bittorrent.org',
    filePattern: /^bep_(\d{4})\.rst$/,
    numberExtractor: (f) => {
      const m = f.match(/bep_(\d{4})/)
      return m ? parseInt(m[1], 10) : undefined
    },
    prLabels: [],
    mirrorPubky: 'pk:bep-mirror',
    subdir: 'beps',
  },
]

export function getSource(namespace: string): SpecSourceConfig | undefined {
  return SOURCES.find(s => s.namespace === namespace)
}

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
    filePattern: /^(\d{1,4})\.md$/,
    numberExtractor: (f) => {
      const m = f.match(/^(\d{1,4})\.md$/)
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
  {
    namespace: 'slip',
    label: 'SLIP',
    repo: 'satoshilabs/slips',
    filePattern: /^slip-(\d{4})\.md$/,
    numberExtractor: (f) => {
      const m = f.match(/slip-(\d{4})/)
      return m ? parseInt(m[1], 10) : undefined
    },
    prLabels: [],
    mirrorPubky: 'pk:slip-mirror',
  },
  {
    namespace: 'caip',
    label: 'CAIP',
    repo: 'ChainAgnostic/CAIPs',
    filePattern: /^caip-(\d+)\.md$/,
    numberExtractor: (f) => {
      const m = f.match(/caip-(\d+)/)
      return m ? parseInt(m[1], 10) : undefined
    },
    prLabels: [],
    mirrorPubky: 'pk:caip-mirror',
    subdir: 'CAIPs',
  },
  {
    namespace: 'ipip',
    label: 'IPIP',
    repo: 'ipfs/specs',
    filePattern: /^ipip-(\d{4})\.md$/,
    numberExtractor: (f) => {
      const m = f.match(/ipip-(\d{4})/)
      return m ? parseInt(m[1], 10) : undefined
    },
    prLabels: [],
    mirrorPubky: 'pk:ipip-mirror',
    subdir: 'src/ipips',
  },
]

export function getSource(namespace: string): SpecSourceConfig | undefined {
  return SOURCES.find(s => s.namespace === namespace)
}

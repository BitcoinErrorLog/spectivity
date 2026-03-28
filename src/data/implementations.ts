/**
 * Implementation status data.
 * Maps spec IDs to known implementations with their support level.
 *
 * In production, this would come from community-submitted attestations
 * and automated release-note scanning.
 */

export interface Implementation {
  project: string
  url: string
  status: 'full' | 'partial' | 'planned' | 'none'
  version?: string
  notes?: string
}

export interface ImplementationRow {
  specId: string
  specTitle: string
  namespace: string
  specNumber?: number
  implementations: Implementation[]
}

const PROJECTS = [
  { name: 'Bitcoin Core', url: 'https://github.com/bitcoin/bitcoin' },
  { name: 'LDK', url: 'https://github.com/lightningdevkit/rust-lightning' },
  { name: 'CLN', url: 'https://github.com/ElementsProject/lightning' },
  { name: 'LND', url: 'https://github.com/lightningnetwork/lnd' },
  { name: 'Sparrow', url: 'https://github.com/sparrowwallet/sparrow' },
  { name: 'Electrum', url: 'https://github.com/spesmilo/electrum' },
]

const IMPL_DATA: Record<string, Record<string, 'full' | 'partial' | 'planned'>> = {
  'bip-1': { 'Bitcoin Core': 'full' },
  'bip-2': { 'Bitcoin Core': 'full' },
  'bip-3': { 'Bitcoin Core': 'full' },
  'bip-8': { 'Bitcoin Core': 'full' },
  'bip-9': { 'Bitcoin Core': 'full', 'LDK': 'full', 'Electrum': 'full' },
  'bip-11': { 'Bitcoin Core': 'full', 'Electrum': 'full' },
  'bip-13': { 'Bitcoin Core': 'full', 'Electrum': 'full', 'Sparrow': 'full' },
  'bip-14': { 'Bitcoin Core': 'full' },
  'bip-16': { 'Bitcoin Core': 'full', 'Electrum': 'full', 'Sparrow': 'full' },
  'bip-21': { 'Bitcoin Core': 'full', 'Electrum': 'full', 'Sparrow': 'full' },
  'bip-22': { 'Bitcoin Core': 'full' },
  'bip-23': { 'Bitcoin Core': 'full' },
  'bip-30': { 'Bitcoin Core': 'full' },
  'bip-31': { 'Bitcoin Core': 'full' },
  'bip-32': { 'Bitcoin Core': 'full', 'Electrum': 'full', 'Sparrow': 'full', 'LDK': 'full' },
  'spec-psbt-v2': { 'Bitcoin Core': 'full', 'Sparrow': 'partial' },
  'spec-silent-payments': { 'Bitcoin Core': 'partial', 'Sparrow': 'planned' },
  'spec-bolt12': { 'CLN': 'full', 'LDK': 'full', 'LND': 'planned' },
  'spec-ordinal-indexing': {},
}

export function getImplementationsForSpec(specId: string): Implementation[] {
  const data = IMPL_DATA[specId]
  if (!data) return []

  return PROJECTS.map(p => ({
    project: p.name,
    url: p.url,
    status: data[p.name] ?? ('none' as const),
  }))
}

export function getImplementationMatrix(specIds: string[]): ImplementationRow[] {
  return specIds
    .map(id => {
      const impls = getImplementationsForSpec(id)
      if (impls.every(i => i.status === 'none')) return null
      return { specId: id, specTitle: '', namespace: '', implementations: impls }
    })
    .filter(Boolean) as ImplementationRow[]
}

export function getProjects() {
  return PROJECTS
}

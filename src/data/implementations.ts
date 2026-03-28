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
  { name: 'btcd', url: 'https://github.com/btcsuite/btcd' },
  { name: 'Sparrow', url: 'https://github.com/sparrowwallet/sparrow' },
  { name: 'Electrum', url: 'https://github.com/spesmilo/electrum' },
  { name: 'Wasabi Wallet', url: 'https://github.com/WalletWasabi/WalletWasabi' },
  { name: 'Blue Wallet', url: 'https://github.com/BlueWallet/BlueWallet' },
  { name: 'Blockstream Green', url: 'https://github.com/Blockstream/green_android' },
  { name: 'LDK', url: 'https://github.com/lightningdevkit/rust-lightning' },
  { name: 'CLN', url: 'https://github.com/ElementsProject/lightning' },
  { name: 'LND', url: 'https://github.com/lightningnetwork/lnd' },
  { name: 'Eclair', url: 'https://github.com/ACINQ/eclair' },
  { name: 'Phoenix', url: 'https://github.com/ACINQ/phoenix' },
  { name: 'Damus', url: 'https://github.com/damus-io/damus' },
  { name: 'Amethyst', url: 'https://github.com/vitorpamplona/amethyst' },
  { name: 'Primal', url: 'https://github.com/PrimalHQ/primal-web-app' },
  { name: 'Snort', url: 'https://github.com/v0l/snort' },
  { name: 'nostr-tools', url: 'https://github.com/nbd-wtf/nostr-tools' },
  { name: 'libtorrent', url: 'https://github.com/arvidn/libtorrent' },
  { name: 'qBittorrent', url: 'https://github.com/qbittorrent/qBittorrent' },
  { name: 'Transmission', url: 'https://github.com/transmission/transmission' },
]

const IMPL_DATA: Record<string, Record<string, 'full' | 'partial' | 'planned'>> = {

  // ═══════════════════════════════════════════════════════════════════
  // BIPs — Process
  // ═══════════════════════════════════════════════════════════════════

  'bip-1': { 'Bitcoin Core': 'full' },
  'bip-2': { 'Bitcoin Core': 'full' },

  // ═══════════════════════════════════════════════════════════════════
  // BIPs — Consensus & Soft-Fork Activation
  // ═══════════════════════════════════════════════════════════════════

  'bip-8': { 'Bitcoin Core': 'full', 'btcd': 'full' },
  'bip-9': { 'Bitcoin Core': 'full', 'btcd': 'full', 'Electrum': 'full' },
  'bip-16': {
    'Bitcoin Core': 'full', 'btcd': 'full', 'Electrum': 'full', 'Sparrow': 'full',
    'Wasabi Wallet': 'full', 'Blue Wallet': 'full', 'Blockstream Green': 'full',
  },
  'bip-30': { 'Bitcoin Core': 'full', 'btcd': 'full' },
  'bip-34': { 'Bitcoin Core': 'full', 'btcd': 'full' },
  'bip-42': { 'Bitcoin Core': 'full', 'btcd': 'full' },
  'bip-65': { 'Bitcoin Core': 'full', 'btcd': 'full', 'Electrum': 'full' },
  'bip-66': { 'Bitcoin Core': 'full', 'btcd': 'full' },
  'bip-68': { 'Bitcoin Core': 'full', 'btcd': 'full' },
  'bip-90': { 'Bitcoin Core': 'full' },
  'bip-112': { 'Bitcoin Core': 'full', 'btcd': 'full' },
  'bip-113': { 'Bitcoin Core': 'full', 'btcd': 'full' },
  'bip-141': {
    'Bitcoin Core': 'full', 'btcd': 'full', 'Electrum': 'full', 'Sparrow': 'full',
    'Wasabi Wallet': 'full', 'Blue Wallet': 'full', 'Blockstream Green': 'full',
  },
  'bip-143': {
    'Bitcoin Core': 'full', 'btcd': 'full', 'Electrum': 'full',
    'Sparrow': 'full', 'Wasabi Wallet': 'full',
  },
  'bip-144': { 'Bitcoin Core': 'full', 'btcd': 'full' },
  'bip-145': { 'Bitcoin Core': 'full' },
  'bip-147': { 'Bitcoin Core': 'full', 'btcd': 'full' },
  'bip-340': {
    'Bitcoin Core': 'full', 'btcd': 'full', 'Electrum': 'full', 'Sparrow': 'full',
    'Wasabi Wallet': 'full', 'Blockstream Green': 'full',
  },
  'bip-341': {
    'Bitcoin Core': 'full', 'btcd': 'full', 'Electrum': 'full', 'Sparrow': 'full',
    'Wasabi Wallet': 'full', 'Blockstream Green': 'full',
  },
  'bip-342': { 'Bitcoin Core': 'full', 'btcd': 'full' },

  // ═══════════════════════════════════════════════════════════════════
  // BIPs — Network & P2P
  // ═══════════════════════════════════════════════════════════════════

  'bip-11': { 'Bitcoin Core': 'full', 'Electrum': 'full' },
  'bip-14': { 'Bitcoin Core': 'full', 'btcd': 'full' },
  'bip-31': { 'Bitcoin Core': 'full', 'btcd': 'full' },
  'bip-35': { 'Bitcoin Core': 'full', 'btcd': 'full' },
  'bip-37': { 'Bitcoin Core': 'partial', 'btcd': 'full', 'Electrum': 'partial' },
  'bip-111': { 'Bitcoin Core': 'full', 'btcd': 'full' },
  'bip-130': { 'Bitcoin Core': 'full', 'btcd': 'full' },
  'bip-133': { 'Bitcoin Core': 'full', 'btcd': 'full' },
  'bip-152': { 'Bitcoin Core': 'full', 'btcd': 'partial' },
  'bip-155': { 'Bitcoin Core': 'full' },
  'bip-157': { 'Bitcoin Core': 'partial', 'btcd': 'full', 'Wasabi Wallet': 'full' },
  'bip-158': { 'Bitcoin Core': 'full', 'btcd': 'full', 'Wasabi Wallet': 'full' },
  'bip-159': { 'Bitcoin Core': 'full' },
  'bip-324': { 'Bitcoin Core': 'full' },
  'bip-325': { 'Bitcoin Core': 'full' },
  'bip-326': { 'Bitcoin Core': 'full' },
  'bip-330': { 'Bitcoin Core': 'partial' },
  'bip-339': { 'Bitcoin Core': 'full' },

  // ═══════════════════════════════════════════════════════════════════
  // BIPs — Wallet, Key Derivation & Addresses
  // ═══════════════════════════════════════════════════════════════════

  'bip-13': {
    'Bitcoin Core': 'full', 'btcd': 'full', 'Electrum': 'full', 'Sparrow': 'full',
    'Wasabi Wallet': 'full', 'Blue Wallet': 'full', 'Blockstream Green': 'full',
  },
  'bip-21': {
    'Bitcoin Core': 'full', 'Electrum': 'full', 'Sparrow': 'full',
    'Wasabi Wallet': 'full', 'Blue Wallet': 'full', 'Blockstream Green': 'full',
  },
  'bip-22': { 'Bitcoin Core': 'full' },
  'bip-23': { 'Bitcoin Core': 'full' },
  'bip-32': {
    'Bitcoin Core': 'full', 'btcd': 'full', 'Electrum': 'full', 'Sparrow': 'full',
    'LDK': 'full', 'Wasabi Wallet': 'full', 'Blue Wallet': 'full', 'Blockstream Green': 'full',
  },
  'bip-39': {
    'Sparrow': 'full', 'Electrum': 'partial', 'Wasabi Wallet': 'full',
    'Blue Wallet': 'full', 'Blockstream Green': 'full',
  },
  'bip-43': {
    'Sparrow': 'full', 'Electrum': 'full', 'Wasabi Wallet': 'full',
    'Blue Wallet': 'full', 'Blockstream Green': 'full',
  },
  'bip-44': {
    'Sparrow': 'full', 'Electrum': 'full', 'Wasabi Wallet': 'partial',
    'Blue Wallet': 'full', 'Blockstream Green': 'full',
  },
  'bip-47': { 'Sparrow': 'full' },
  'bip-48': { 'Sparrow': 'full', 'Electrum': 'full' },
  'bip-49': {
    'Sparrow': 'full', 'Electrum': 'full',
    'Blue Wallet': 'full', 'Blockstream Green': 'full',
  },
  'bip-84': {
    'Sparrow': 'full', 'Electrum': 'full', 'Wasabi Wallet': 'full',
    'Blue Wallet': 'full', 'Blockstream Green': 'full',
  },
  'bip-86': {
    'Sparrow': 'full', 'Electrum': 'full',
    'Wasabi Wallet': 'full', 'Blockstream Green': 'full',
  },
  'bip-125': {
    'Bitcoin Core': 'full', 'Electrum': 'full', 'Sparrow': 'full',
    'Wasabi Wallet': 'full', 'Blue Wallet': 'full', 'Blockstream Green': 'full',
  },
  'bip-173': {
    'Bitcoin Core': 'full', 'btcd': 'full', 'Electrum': 'full', 'Sparrow': 'full',
    'LDK': 'full', 'Wasabi Wallet': 'full', 'Blue Wallet': 'full', 'Blockstream Green': 'full',
  },
  'bip-174': {
    'Bitcoin Core': 'full', 'Electrum': 'full', 'Sparrow': 'full',
    'Wasabi Wallet': 'full', 'Blue Wallet': 'partial', 'Blockstream Green': 'full',
  },
  'bip-350': {
    'Bitcoin Core': 'full', 'btcd': 'full', 'Electrum': 'full', 'Sparrow': 'full',
    'Wasabi Wallet': 'full', 'Blue Wallet': 'full', 'Blockstream Green': 'full',
  },
  'bip-352': { 'Bitcoin Core': 'partial', 'Sparrow': 'planned' },
  'bip-370': { 'Sparrow': 'full', 'Bitcoin Core': 'partial' },
  'bip-371': { 'Bitcoin Core': 'full', 'Sparrow': 'full' },
  'bip-380': { 'Bitcoin Core': 'full', 'Sparrow': 'full' },
  'bip-381': { 'Bitcoin Core': 'full', 'Sparrow': 'full' },
  'bip-382': { 'Bitcoin Core': 'full', 'Sparrow': 'full' },
  'bip-383': { 'Bitcoin Core': 'full', 'Sparrow': 'full' },
  'bip-384': { 'Bitcoin Core': 'full', 'Sparrow': 'full' },
  'bip-385': { 'Bitcoin Core': 'full', 'Sparrow': 'full' },
  'bip-386': { 'Bitcoin Core': 'full', 'Sparrow': 'full' },

  // Legacy spec-* aliases for backward compatibility
  'spec-psbt-v2': { 'Sparrow': 'full', 'Bitcoin Core': 'partial' },
  'spec-silent-payments': { 'Bitcoin Core': 'partial', 'Sparrow': 'planned' },
  'spec-bolt12': { 'CLN': 'full', 'LDK': 'full', 'LND': 'planned', 'Eclair': 'full', 'Phoenix': 'full' },
  'spec-ordinal-indexing': {},

  // ═══════════════════════════════════════════════════════════════════
  // BOLTs — Lightning Network
  // ═══════════════════════════════════════════════════════════════════

  'bolt-1': { 'LDK': 'full', 'CLN': 'full', 'LND': 'full', 'Eclair': 'full', 'Phoenix': 'full' },
  'bolt-2': { 'LDK': 'full', 'CLN': 'full', 'LND': 'full', 'Eclair': 'full', 'Phoenix': 'full' },
  'bolt-3': { 'LDK': 'full', 'CLN': 'full', 'LND': 'full', 'Eclair': 'full', 'Phoenix': 'full' },
  'bolt-4': { 'LDK': 'full', 'CLN': 'full', 'LND': 'full', 'Eclair': 'full', 'Phoenix': 'full' },
  'bolt-5': { 'LDK': 'full', 'CLN': 'full', 'LND': 'full', 'Eclair': 'full', 'Phoenix': 'full' },
  'bolt-7': { 'LDK': 'full', 'CLN': 'full', 'LND': 'full', 'Eclair': 'full', 'Phoenix': 'partial' },
  'bolt-8': { 'LDK': 'full', 'CLN': 'full', 'LND': 'full', 'Eclair': 'full', 'Phoenix': 'full' },
  'bolt-9': { 'LDK': 'full', 'CLN': 'full', 'LND': 'full', 'Eclair': 'full', 'Phoenix': 'full' },
  'bolt-10': { 'LDK': 'partial', 'CLN': 'full', 'LND': 'full', 'Eclair': 'full', 'Phoenix': 'partial' },
  'bolt-11': { 'LDK': 'full', 'CLN': 'full', 'LND': 'full', 'Eclair': 'full', 'Phoenix': 'full' },
  'bolt-12': { 'CLN': 'full', 'LDK': 'full', 'LND': 'planned', 'Eclair': 'full', 'Phoenix': 'full' },

  // ═══════════════════════════════════════════════════════════════════
  // NIPs — Nostr
  // ═══════════════════════════════════════════════════════════════════

  'nip-1': { 'Damus': 'full', 'Amethyst': 'full', 'Primal': 'full', 'Snort': 'full', 'nostr-tools': 'full' },
  'nip-2': { 'Damus': 'full', 'Amethyst': 'full', 'Primal': 'full', 'Snort': 'full', 'nostr-tools': 'full' },
  'nip-4': { 'Damus': 'full', 'Amethyst': 'full', 'Snort': 'full', 'nostr-tools': 'full', 'Primal': 'partial' },
  'nip-5': { 'Damus': 'full', 'Amethyst': 'full', 'Primal': 'full', 'Snort': 'full', 'nostr-tools': 'full' },
  'nip-6': { 'Amethyst': 'full', 'nostr-tools': 'full' },
  'nip-7': { 'Snort': 'full', 'Primal': 'full', 'nostr-tools': 'full' },
  'nip-9': { 'Damus': 'full', 'Amethyst': 'full', 'Primal': 'full', 'Snort': 'full', 'nostr-tools': 'full' },
  'nip-10': { 'Damus': 'full', 'Amethyst': 'full', 'Primal': 'full', 'Snort': 'full', 'nostr-tools': 'full' },
  'nip-11': { 'Damus': 'full', 'Amethyst': 'full', 'Snort': 'full', 'nostr-tools': 'full', 'Primal': 'partial' },
  'nip-13': { 'nostr-tools': 'full', 'Amethyst': 'partial' },
  'nip-14': { 'Amethyst': 'full', 'nostr-tools': 'full', 'Snort': 'partial' },
  'nip-17': { 'Amethyst': 'full', 'Damus': 'full', 'nostr-tools': 'full', 'Snort': 'partial' },
  'nip-18': { 'Damus': 'full', 'Amethyst': 'full', 'Primal': 'full', 'Snort': 'full', 'nostr-tools': 'full' },
  'nip-19': { 'Damus': 'full', 'Amethyst': 'full', 'Primal': 'full', 'Snort': 'full', 'nostr-tools': 'full' },
  'nip-21': { 'Damus': 'full', 'Amethyst': 'full', 'Primal': 'full', 'Snort': 'full', 'nostr-tools': 'full' },
  'nip-23': { 'Damus': 'full', 'Amethyst': 'full', 'Snort': 'full', 'nostr-tools': 'full', 'Primal': 'partial' },
  'nip-25': { 'Damus': 'full', 'Amethyst': 'full', 'Primal': 'full', 'Snort': 'full', 'nostr-tools': 'full' },
  'nip-27': { 'Damus': 'full', 'Amethyst': 'full', 'Primal': 'full', 'Snort': 'full', 'nostr-tools': 'full' },
  'nip-28': { 'Amethyst': 'full', 'nostr-tools': 'full', 'Snort': 'partial' },
  'nip-29': { 'Amethyst': 'full', 'nostr-tools': 'partial' },
  'nip-30': { 'Amethyst': 'full', 'Snort': 'partial' },
  'nip-31': { 'Amethyst': 'full', 'nostr-tools': 'full' },
  'nip-33': { 'Damus': 'full', 'Amethyst': 'full', 'Primal': 'full', 'Snort': 'full', 'nostr-tools': 'full' },
  'nip-36': { 'Damus': 'full', 'Amethyst': 'full', 'Primal': 'full', 'Snort': 'full' },
  'nip-38': { 'Amethyst': 'full' },
  'nip-39': { 'Amethyst': 'full', 'Primal': 'partial' },
  'nip-40': { 'Amethyst': 'full', 'nostr-tools': 'full' },
  'nip-42': { 'nostr-tools': 'full', 'Amethyst': 'full', 'Damus': 'full', 'Snort': 'full' },
  'nip-44': { 'Amethyst': 'full', 'nostr-tools': 'full', 'Damus': 'full', 'Snort': 'full' },
  'nip-46': { 'nostr-tools': 'full', 'Amethyst': 'partial' },
  'nip-47': { 'Amethyst': 'full', 'Primal': 'full', 'nostr-tools': 'full', 'Damus': 'full' },
  'nip-49': { 'nostr-tools': 'full' },
  'nip-50': { 'Primal': 'full', 'Snort': 'partial', 'nostr-tools': 'full' },
  'nip-51': { 'Damus': 'full', 'Amethyst': 'full', 'Primal': 'partial', 'Snort': 'full', 'nostr-tools': 'full' },
  'nip-57': { 'Damus': 'full', 'Amethyst': 'full', 'Primal': 'full', 'Snort': 'full', 'nostr-tools': 'full' },
  'nip-58': { 'Amethyst': 'full', 'nostr-tools': 'partial' },
  'nip-65': { 'Damus': 'full', 'Amethyst': 'full', 'Primal': 'full', 'Snort': 'full', 'nostr-tools': 'full' },

  // ═══════════════════════════════════════════════════════════════════
  // BEPs — BitTorrent
  // ═══════════════════════════════════════════════════════════════════

  'bep-3': { 'libtorrent': 'full', 'qBittorrent': 'full', 'Transmission': 'full' },
  'bep-5': { 'libtorrent': 'full', 'qBittorrent': 'full', 'Transmission': 'full' },
  'bep-6': { 'libtorrent': 'full', 'qBittorrent': 'full', 'Transmission': 'full' },
  'bep-9': { 'libtorrent': 'full', 'qBittorrent': 'full', 'Transmission': 'full' },
  'bep-10': { 'libtorrent': 'full', 'qBittorrent': 'full', 'Transmission': 'full' },
  'bep-11': { 'libtorrent': 'full', 'qBittorrent': 'full', 'Transmission': 'full' },
  'bep-12': { 'libtorrent': 'full', 'qBittorrent': 'full', 'Transmission': 'full' },
  'bep-14': { 'libtorrent': 'full', 'qBittorrent': 'full', 'Transmission': 'full' },
  'bep-15': { 'libtorrent': 'full', 'qBittorrent': 'full', 'Transmission': 'full' },
  'bep-19': { 'libtorrent': 'full', 'qBittorrent': 'full', 'Transmission': 'full' },
  'bep-23': { 'libtorrent': 'full', 'qBittorrent': 'full', 'Transmission': 'full' },
  'bep-27': { 'libtorrent': 'full', 'qBittorrent': 'full', 'Transmission': 'full' },
  'bep-29': { 'libtorrent': 'full', 'qBittorrent': 'full', 'Transmission': 'full' },
  'bep-32': { 'libtorrent': 'full', 'qBittorrent': 'full', 'Transmission': 'partial' },
  'bep-40': { 'libtorrent': 'full', 'qBittorrent': 'full', 'Transmission': 'full' },
  'bep-42': { 'libtorrent': 'full', 'qBittorrent': 'full' },
  'bep-44': { 'libtorrent': 'full', 'qBittorrent': 'partial' },
  'bep-47': { 'libtorrent': 'full', 'qBittorrent': 'full' },
  'bep-52': { 'libtorrent': 'full', 'qBittorrent': 'full', 'Transmission': 'partial' },
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

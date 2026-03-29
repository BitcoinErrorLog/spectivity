#!/usr/bin/env npx tsx
/**
 * Multi-ecosystem spec sync script for Spectivity.
 *
 * Mirrors specs from multiple GitHub repositories into unified JSON.
 * Each source is defined in sources.ts with repo-specific parsing rules.
 *
 * Usage:
 *   npx tsx scripts/sync-all.ts                          # sync all sources
 *   npx tsx scripts/sync-all.ts --namespace bip          # sync BIPs only
 *   npx tsx scripts/sync-all.ts --namespace nip          # sync NIPs only
 *   npx tsx scripts/sync-all.ts --limit 30               # limit per source
 *   GITHUB_TOKEN=ghp_xxx npx tsx scripts/sync-all.ts     # authenticated
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { config as dotenvConfig } from 'dotenv'
import { SOURCES, type SpecSourceConfig } from './sources.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenvConfig({ path: path.resolve(__dirname, '../.env.local') })
dotenvConfig({ path: path.resolve(__dirname, '../.env') })

const OUTPUT_DIR = path.resolve(__dirname, '../src/data/synced')
const GITHUB_API = 'https://api.github.com'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? ''

const headers: Record<string, string> = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'spectivity-sync/1.0',
}
if (GITHUB_TOKEN) headers['Authorization'] = `token ${GITHUB_TOKEN}`

interface SyncedSpec {
  id: string
  namespace: string
  authorPubky: string
  uri: string
  title: string
  summary: string
  body: string
  typeLabel: 'specification' | 'informational' | 'process'
  topicTags: string[]
  createdAt: string
  updatedAt: string
  revisionUris: string[]
  discussionLinks: string[]
  source: 'merged' | 'open-pr' | 'closed-pr' | 'rejected-pr'
  sourceUrl: string
  specNumber?: number
  prNumber?: number
  githubAuthor: string
  status?: string
  layer?: string
  requires?: string
  replaces?: string
}

interface SyncedReview {
  id: string
  specId: string
  reviewerPubky: string
  label: string
  createdAt: number
  githubUser: string
}

async function ghFetch(url: string): Promise<any> {
  const res = await fetch(url, { headers })
  if (res.status === 403) {
    const remaining = res.headers.get('x-ratelimit-remaining')
    if (remaining === '0') {
      console.warn(`\nRate limited. Saving partial progress.`)
      throw new Error('RATE_LIMIT')
    }
  }
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${url}`)
  return res.json()
}

async function ghFetchAll(baseUrl: string): Promise<any[]> {
  const results: any[] = []
  let url: string | null = baseUrl.includes('?') ? `${baseUrl}&per_page=100` : `${baseUrl}?per_page=100`

  while (url) {
    const res: Response = await fetch(url, { headers })
    if (res.status === 403) {
      const remaining = res.headers.get('x-ratelimit-remaining')
      if (remaining === '0') {
        console.warn(`\nRate limited during pagination. Returning partial results.`)
        throw new Error('RATE_LIMIT')
      }
    }
    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${url}`)
    const data = await res.json()
    results.push(...(Array.isArray(data) ? data : []))

    const link = res.headers.get('link')
    const next = link?.match(/<([^>]+)>;\s*rel="next"/)
    url = next ? next[1] : null
  }
  return results
}

async function ghText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { ...headers, 'Accept': 'text/plain' } })
  if (!res.ok) throw new Error(`Fetch ${res.status}: ${url}`)
  return res.text()
}

// --- Preamble parsers per format ---

function parseBipPreamble(content: string): Record<string, string> {
  const p: Record<string, string> = {}
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  let inside = false
  for (const line of lines) {
    const t = line.trim()
    if (t === '<pre>' || t === '```') { inside = true; continue }
    if ((t === '</pre>' || t === '```') && inside) break
    if (inside || /^\s+(BIP|Layer|Title|Author|Status|Type|Assigned|License|Requires|Replaces):/.test(line)) {
      inside = true
      const m = line.match(/^\s*([\w-]+)\s*:\s*(.*)$/)
      if (m) p[m[1].trim().toLowerCase()] = m[2].trim()
    }
  }
  return p
}

function parseNipContent(content: string): { title: string; summary: string; status?: string } {
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  let title = 'Untitled NIP'

  // NIPs use RST-style underlines: "NIP-01\n======\n\nTitle text\n----------"
  for (let i = 0; i < lines.length - 1; i++) {
    const cur = lines[i].trim()
    const next = lines[i + 1]?.trim()
    if (/^NIP-\d+/.test(cur) && next && /^[=]+$/.test(next)) {
      // The subtitle (actual title) is typically 2 lines later
      for (let j = i + 2; j < lines.length; j++) {
        const sub = lines[j].trim()
        if (!sub) continue
        const subNext = lines[j + 1]?.trim()
        if (subNext && /^[-]+$/.test(subNext)) {
          title = sub
          break
        }
        if (sub && !sub.startsWith('#') && !sub.startsWith('=') && !sub.startsWith('-') && sub.length > 3) {
          title = sub
          break
        }
      }
      break
    }
  }

  // Also try markdown heading format (some NIPs use this)
  if (title === 'Untitled NIP') {
    const mdTitle = content.match(/^#\s+NIP-\d+\s*\n+##\s+(.+)/m)
      ?? content.match(/^#\s+(.+)/m)
    if (mdTitle) title = mdTitle[1].trim()
  }

  // Extract summary: first substantial paragraph after the title block
  let summary = ''
  const statusMatch = content.match(/`(draft|mandatory|optional|deprecated|final)`/i)
  const statusLineIdx = lines.findIndex(l => /`(draft|mandatory|optional|deprecated|final)`/i.test(l))
  const startIdx = statusLineIdx >= 0 ? statusLineIdx + 1 : 0

  const paragraphs: string[] = []
  let buf = ''
  for (let i = startIdx; i < lines.length; i++) {
    const l = lines[i]
    if (l.trim() === '') {
      if (buf.trim()) paragraphs.push(buf.trim())
      buf = ''
    } else if (/^[#=\-]+$/.test(l.trim()) || /^NIP-\d+$/.test(l.trim())) {
      if (buf.trim()) paragraphs.push(buf.trim())
      buf = ''
    } else {
      buf += ' ' + l
    }
  }
  if (buf.trim()) paragraphs.push(buf.trim())

  const goodParagraphs = paragraphs.filter(p =>
    p.length > 20 && !p.startsWith('`') && !p.startsWith('---') && !p.startsWith('NIP-')
  )
  summary = goodParagraphs.slice(0, 2).join(' ').slice(0, 400)
  if (!summary) summary = 'Nostr protocol specification.'

  return { title, summary, status: statusMatch?.[1] }
}

function parseBoltContent(content: string): { title: string; summary: string } {
  const titleMatch = content.match(/^#\s+BOLT\s+#?\d+:?\s*(.+)/m)
    ?? content.match(/^#\s+(.+)/m)
  const title = titleMatch ? titleMatch[1].trim() : 'Untitled BOLT'

  const summaryMatch = content.match(/\n\n([\s\S]*?)(?=\n##|\n#)/m)
  const summary = summaryMatch
    ? summaryMatch[1].trim().replace(/\n/g, ' ').slice(0, 400)
    : 'Lightning Network specification.'

  return { title, summary }
}

function parseBepContent(content: string): { title: string; summary: string; status?: string; type?: string } {
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const fields: Record<string, string> = {}

  // BEPs use RST field-list format ":Field: value" (with leading colons)
  // Some BEPs (e.g. 1000) use "Field: value" without leading colons
  for (const line of lines) {
    const m = line.match(/^:([\w-]+):\s*(.+)$/)
    if (m) {
      fields[m[1].trim().toLowerCase()] = m[2].trim()
      continue
    }
    const m3 = line.match(/^(BEP|Title|Version|Status|Type|Author|Created|Last-Modified):\s*(.+)$/i)
    if (m3) {
      const key = m3[1].trim().toLowerCase()
      if (!fields[key]) fields[key] = m3[2].trim()
      continue
    }
    const m2 = line.match(/^\.\.\s+([\w\s]+):\s*(.+)$/)
    if (m2) {
      const key = m2[1].trim().toLowerCase()
      if (!fields[key]) fields[key] = m2[2].trim()
    }
  }

  let title = fields['title'] ?? 'Untitled BEP'
  const status = fields['status']
  const type = fields['type']

  // Extract the first real paragraph after the field list as summary
  let summary = ''
  const abstractMatch = content.match(/(?:^|\n)Abstract\n[-=]+\n([\s\S]*?)(?=\n[A-Z][\w\s]*\n[-=]+|\n\.\.|$)/i)
  if (abstractMatch) {
    summary = abstractMatch[1].trim().replace(/\n/g, ' ').slice(0, 400)
  } else {
    // Find first paragraph after the header fields
    let pastFields = false
    const paragraphLines: string[] = []
    for (const line of lines) {
      if (!pastFields) {
        if (line.trim() === '' && Object.keys(fields).length > 0) pastFields = true
        continue
      }
      if (line.trim() === '' && paragraphLines.length > 0) break
      if (/^[-=]+$/.test(line.trim())) continue
      if (line.trim()) paragraphLines.push(line.trim())
    }
    summary = paragraphLines.join(' ').slice(0, 400)
  }

  if (!summary) summary = 'BitTorrent Enhancement Proposal.'

  return { title, summary, status, type }
}

function parseSlipContent(content: string): { title: string; summary: string; status?: string; type?: string } {
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const fields: Record<string, string> = {}

  // SLIPs have a heading like "# SLIP-0044 : Title" then a fenced preamble block
  let inPreamble = false
  for (const line of lines) {
    const t = line.trim()
    if (t === '```') {
      if (inPreamble) break
      inPreamble = true
      continue
    }
    if (inPreamble) {
      const m = t.match(/^([\w-]+)\s*:\s*(.+)$/)
      if (m) fields[m[1].trim().toLowerCase()] = m[2].trim()
    }
  }

  // Also try heading for title: "# SLIP-0044 : Registered coin types for BIP-0044"
  const headingMatch = content.match(/^#\s+SLIP-\d+\s*:\s*(.+)/m)
  let title = fields['title'] ?? (headingMatch ? headingMatch[1].trim() : 'Untitled SLIP')
  const status = fields['status']
  const type = fields['type']

  // Extract abstract section
  const abstractMatch = content.match(/##\s*Abstract\s*\n+([\s\S]*?)(?=\n##|\n#|$)/i)
  let summary = ''
  if (abstractMatch) {
    summary = abstractMatch[1].trim().replace(/\n/g, ' ').slice(0, 400)
  } else {
    const paragraphs = content.split('\n\n')
      .map(p => p.trim())
      .filter(p => p.length > 30 && !p.startsWith('#') && !p.startsWith('```') && !p.startsWith('Number:'))
    summary = (paragraphs[0] ?? 'SatoshiLabs Improvement Proposal.').slice(0, 400)
  }

  return { title, summary, status, type }
}

function extractAbstract(content: string): string {
  const patterns = [
    /===\s*Abstract\s*===\s*\n+([\s\S]*?)(?=\n===|\n==)/i,
    /##\s*Abstract\s*\n+([\s\S]*?)(?=\n##|\n#)/i,
  ]
  for (const p of patterns) {
    const m = content.match(p)
    if (m) return m[1].trim().replace(/'''.*?'''/g, '').replace(/<[^>]+>/g, '').slice(0, 500)
  }
  return content.split('\n').filter(l => l.trim() && !l.startsWith('=') && !l.startsWith('#') && !l.startsWith('<')).slice(0, 3).join(' ').slice(0, 300) || 'No abstract.'
}

function extractTopicTags(text: string, namespace: string): string[] {
  const tags: string[] = []
  const kw: [RegExp, string][] = [
    [/wallet/i, 'wallet'], [/lightning|bolt|channel/i, 'lightning'], [/privacy|stealth|silent/i, 'privacy'],
    [/taproot|schnorr/i, 'taproot'], [/segwit/i, 'segwit'], [/psbt/i, 'psbt'], [/opcode|op_/i, 'opcodes'],
    [/covenant/i, 'covenants'], [/inscription|ordinal/i, 'ordinals'], [/payment/i, 'payments'],
    [/address/i, 'addresses'], [/key|derivation|hd/i, 'key-management'], [/mining|miner/i, 'mining'],
    [/transaction/i, 'transactions'], [/script/i, 'script'], [/relay/i, 'relay'], [/nostr/i, 'nostr'],
    [/event\b/i, 'events'], [/\bdht\b/i, 'dht'], [/torrent|peer/i, 'p2p'],
  ]
  for (const [p, t] of kw) {
    if (t === namespace) continue
    if (p.test(text) && !tags.includes(t)) tags.push(t)
  }
  return tags.slice(0, 6)
}

function bipTypeToLabel(type: string): 'specification' | 'informational' | 'process' {
  const l = type.toLowerCase()
  if (l.includes('informational')) return 'informational'
  if (l.includes('process')) return 'process'
  return 'specification'
}

function extractStance(body: string): string | null {
  const stripped = body.replace(/^>\s*.*/gm, '').replace(/```[\s\S]*?```/g, '').trim()
  if (/\b(concept[\s_-]?ack)\b/i.test(stripped)) return 'concept-ack'
  if (/\butack\b/i.test(stripped)) return 'ack'
  if (/\bnack\b/i.test(stripped)) return 'nack'
  if (/\back\b/i.test(stripped) && !/\bnack\b/i.test(stripped)) return 'ack'
  if (/\bneeds[\s_-]work\b/i.test(stripped)) return 'needs-work'
  return null
}

// --- Core sync ---

async function syncMergedFiles(source: SpecSourceConfig, limit: number): Promise<SyncedSpec[]> {
  const contentPath = source.subdir ? `${source.repo}/contents/${source.subdir}` : `${source.repo}/contents`
  console.log(`  Fetching file list from ${contentPath}...`)

  let contents: any[]
  try {
    contents = await ghFetch(`${GITHUB_API}/repos/${contentPath}`)
  } catch {
    console.log(`  Using Git Trees API for full listing...`)
    const defaultBranch = (await ghFetch(`${GITHUB_API}/repos/${source.repo}`)).default_branch ?? 'master'
    const tree = await ghFetch(`${GITHUB_API}/repos/${source.repo}/git/trees/${defaultBranch}?recursive=1`)
    const prefix = source.subdir ? `${source.subdir}/` : ''
    contents = (tree.tree ?? [])
      .filter((t: any) => t.type === 'blob' && t.path.startsWith(prefix))
      .map((t: any) => ({
        name: t.path.split('/').pop(),
        path: t.path,
        type: 'file',
        download_url: `https://raw.githubusercontent.com/${source.repo}/${defaultBranch}/${t.path}`,
        html_url: `https://github.com/${source.repo}/blob/${defaultBranch}/${t.path}`,
      }))
  }

  const files = contents
    .filter((f: any) => f.type === 'file' && source.filePattern.test(f.name))
    .slice(0, limit)

  console.log(`  Found ${files.length} spec files`)
  const specs: SyncedSpec[] = []

  for (const file of files) {
    const num = source.numberExtractor(file.name)
    try {
      const content = await ghText(file.download_url)
      let title: string, summary: string, type: 'specification' | 'informational' | 'process' = 'specification'
      let status: string | undefined, layer: string | undefined
      let requires: string | undefined, replaces: string | undefined

      if (source.namespace === 'bip') {
        const p = parseBipPreamble(content)
        title = `BIP ${num}: ${p.title ?? `BIP ${num}`}`
        summary = extractAbstract(content)
        type = bipTypeToLabel(p.type ?? '')
        status = p.status; layer = p.layer
        requires = p.requires; replaces = p.replaces
      } else if (source.namespace === 'nip') {
        const parsed = parseNipContent(content)
        title = `NIP-${String(num).padStart(2, '0')}: ${parsed.title}`
        summary = parsed.summary
        status = parsed.status
      } else if (source.namespace === 'bolt') {
        const parsed = parseBoltContent(content)
        title = `BOLT ${num}: ${parsed.title}`
        summary = parsed.summary
      } else if (source.namespace === 'bep') {
        const parsed = parseBepContent(content)
        title = `BEP ${num}: ${parsed.title}`
        summary = parsed.summary
        status = parsed.status
        type = bipTypeToLabel(parsed.type ?? '')
      } else if (source.namespace === 'slip') {
        const parsed = parseSlipContent(content)
        title = `SLIP ${num}: ${parsed.title}`
        summary = parsed.summary
        status = parsed.status
        type = bipTypeToLabel(parsed.type ?? '')
      } else {
        title = `${source.label} ${num}: ${file.name}`
        summary = content.split('\n').filter((l: string) => l.trim()).slice(0, 3).join(' ').slice(0, 300)
      }

      const authorMatch = content.match(/(?:author|by|Author)[s]?\s*[:=]\s*(.+)/i)
      const githubAuthor = authorMatch ? authorMatch[1].replace(/<[^>]+>/g, '').trim().split('\n')[0] : 'Unknown'

      specs.push({
        id: `${source.namespace}-${num}`,
        namespace: source.namespace,
        authorPubky: source.mirrorPubky,
        uri: `pubky://${source.mirrorPubky}/pub/pubky.app/posts/${source.namespace}-${num}`,
        title, summary,
        body: content.slice(0, 50000),
        typeLabel: type,
        topicTags: extractTopicTags(title + ' ' + content.slice(0, 2000), source.namespace),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        revisionUris: [], discussionLinks: [],
        source: 'merged',
        sourceUrl: file.html_url,
        specNumber: num,
        githubAuthor,
        status, layer, requires, replaces,
      })
      process.stdout.write('.')
    } catch (err: any) {
      if (err.message === 'RATE_LIMIT') throw err
      console.error(`\n  Failed: ${file.name}: ${err.message?.slice(0, 80)}`)
    }
  }
  console.log(`\n  ${specs.length} merged specs`)
  return specs
}

async function syncPRs(source: SpecSourceConfig, limit: number): Promise<{ specs: SyncedSpec[]; reviews: SyncedReview[] }> {
  if (source.prLabels.length === 0) return { specs: [], reviews: [] }

  console.log(`  Fetching PRs from ${source.repo}...`)
  const specs: SyncedSpec[] = []
  const reviews: SyncedReview[] = []

  for (const state of ['open', 'closed'] as const) {
    try {
      const prs: any[] = await ghFetchAll(
        `${GITHUB_API}/repos/${source.repo}/pulls?state=${state}&sort=updated&direction=desc`
      )
      for (const pr of prs) {
        const labels = (pr.labels ?? []).map((l: any) => l.name)
        const isRelevant = source.prLabels.some(pl => labels.includes(pl)) || pr.title?.toLowerCase().includes(source.namespace)
        if (!isRelevant) continue

        const isMerged = pr.merged_at != null
        const prSource: SyncedSpec['source'] = isMerged ? 'merged'
          : state === 'open' ? 'open-pr'
          : source.prLabels.some(pl => labels.includes(pl)) ? 'rejected-pr'
          : 'closed-pr'

        specs.push({
          id: `pr-${pr.number}`,
          namespace: source.namespace,
          authorPubky: source.mirrorPubky,
          uri: `pubky://${source.mirrorPubky}/pub/pubky.app/posts/pr-${pr.number}`,
          title: pr.title,
          summary: (pr.body ?? '').replace(/\r\n/g, '\n').slice(0, 500),
          body: (pr.body ?? '').replace(/\r\n/g, '\n').slice(0, 50000),
          typeLabel: 'informational',
          topicTags: extractTopicTags(pr.title + ' ' + (pr.body ?? '').slice(0, 1000), source.namespace),
          createdAt: pr.created_at,
          updatedAt: pr.updated_at,
          revisionUris: [], discussionLinks: [pr.html_url],
          source: prSource,
          sourceUrl: pr.html_url,
          prNumber: pr.number,
          githubAuthor: pr.user?.login ?? 'unknown',
        })

        if (source.prLabels.some(pl => labels.includes(pl))) {
          try {
            const comments: any[] = await ghFetchAll(
              `${GITHUB_API}/repos/${source.repo}/issues/${pr.number}/comments`
            )
            for (const c of comments) {
              const stance = extractStance(c.body ?? '')
              if (!stance) continue
              reviews.push({
                id: `rev-pr${pr.number}-${c.id}`,
                specId: `pr-${pr.number}`,
                reviewerPubky: `pk:gh-${c.user?.login ?? 'unknown'}`,
                label: stance,
                createdAt: new Date(c.created_at).getTime(),
                githubUser: c.user?.login ?? 'unknown',
              })
            }
          } catch {}
        }
        process.stdout.write('.')
      }
    } catch (err: any) {
      if (err.message === 'RATE_LIMIT') throw err
      console.error(`\n  PR fetch error: ${err.message?.slice(0, 80)}`)
    }
  }
  console.log(`\n  ${specs.length} PRs, ${reviews.length} reviews`)
  return { specs, reviews }
}

// --- Main ---

async function main() {
  const args = process.argv.slice(2)
  const nsIdx = args.indexOf('--namespace')
  const targetNs = nsIdx >= 0 ? args[nsIdx + 1] : undefined
  const limitIdx = args.indexOf('--limit')
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : 9999

  const sources = targetNs ? SOURCES.filter(s => s.namespace === targetNs) : SOURCES

  console.log(`=== Spectivity Sync ===`)
  console.log(`Sources: ${sources.map(s => s.namespace).join(', ')}`)
  console.log(`Limit: ${limit} per source`)
  if (!GITHUB_TOKEN) console.log(`Warning: No GITHUB_TOKEN. Rate limit is 60 req/hr.`)
  console.log()

  let allSpecs: SyncedSpec[] = []
  let allReviews: SyncedReview[] = []
  const allAuthors = new Map<string, { githubLogin: string; name: string; bio: string }>()

  for (const source of sources) {
    console.log(`[${source.namespace.toUpperCase()}] Syncing ${source.repo}...`)
    try {
      const merged = await syncMergedFiles(source, limit)
      allSpecs.push(...merged)

      const { specs: prSpecs, reviews } = await syncPRs(source, limit)
      const existingIds = new Set(allSpecs.map(s => s.id))
      allSpecs.push(...prSpecs.filter(s => !existingIds.has(s.id)))
      allReviews.push(...reviews)

      for (const spec of [...merged, ...prSpecs]) {
        const key = `gh:${spec.githubAuthor}`
        if (!allAuthors.has(key)) {
          allAuthors.set(key, { githubLogin: spec.githubAuthor, name: spec.githubAuthor, bio: `${source.label} contributor.` })
        }
      }
      for (const rev of reviews) {
        const key = `gh:${rev.githubUser}`
        if (!allAuthors.has(key)) {
          allAuthors.set(key, { githubLogin: rev.githubUser, name: rev.githubUser, bio: `${source.label} reviewer.` })
        }
      }
    } catch (err: any) {
      if (err.message === 'RATE_LIMIT') {
        console.log(`\nRate limited during ${source.namespace}. Saving what we have.`)
        break
      }
      console.error(`\nError syncing ${source.namespace}: ${err.message}`)
    }
    console.log()
  }

  allSpecs.sort((a, b) => {
    if (a.namespace !== b.namespace) return a.namespace.localeCompare(b.namespace)
    if (a.specNumber && b.specNumber) return a.specNumber - b.specNumber
    if (a.specNumber) return -1
    if (b.specNumber) return 1
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  fs.writeFileSync(path.join(OUTPUT_DIR, 'specs.json'), JSON.stringify(allSpecs, null, 2))
  fs.writeFileSync(path.join(OUTPUT_DIR, 'reviews.json'), JSON.stringify(allReviews, null, 2))
  fs.writeFileSync(path.join(OUTPUT_DIR, 'authors.json'), JSON.stringify(Object.fromEntries(allAuthors), null, 2))

  const byNs: Record<string, { merged: number; open: number; closed: number; rejected: number }> = {}
  for (const s of allSpecs) {
    if (!byNs[s.namespace]) byNs[s.namespace] = { merged: 0, open: 0, closed: 0, rejected: 0 }
    if (s.source === 'merged') byNs[s.namespace].merged++
    else if (s.source === 'open-pr') byNs[s.namespace].open++
    else if (s.source === 'closed-pr') byNs[s.namespace].closed++
    else if (s.source === 'rejected-pr') byNs[s.namespace].rejected++
  }

  const meta = { syncedAt: new Date().toISOString(), totalSpecs: allSpecs.length, totalReviews: allReviews.length, totalAuthors: allAuthors.size, byNamespace: byNs }
  fs.writeFileSync(path.join(OUTPUT_DIR, 'meta.json'), JSON.stringify(meta, null, 2))

  console.log(`=== Sync Complete ===`)
  console.log(`Total: ${meta.totalSpecs} specs, ${meta.totalReviews} reviews, ${meta.totalAuthors} authors`)
  for (const [ns, counts] of Object.entries(byNs)) {
    console.log(`  ${ns.toUpperCase()}: ${counts.merged} merged, ${counts.open} open, ${counts.closed} closed, ${counts.rejected} rejected`)
  }
}

main().catch(err => { console.error('Sync failed:', err); process.exit(1) })

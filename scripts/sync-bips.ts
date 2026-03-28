#!/usr/bin/env npx tsx
/**
 * BIP-to-Pubky Sync Script
 *
 * Mirrors the bitcoin/bips GitHub repository into PubkyAppPost-shaped JSON objects.
 * Designed to run as a cron job or one-shot import.
 *
 * Sources:
 *   1. Merged BIPs (files in the repo: bip-XXXX.mediawiki / bip-XXXX.md)
 *   2. Open and closed PRs labeled "New BIP" (including rejected ones like Ordinals #1408)
 *
 * Output:
 *   - data/synced/specs.json      — array of Spec objects
 *   - data/synced/reviews.json    — array of Review objects (extracted from PR comments)
 *   - data/synced/authors.json    — map of GitHub login -> author info
 *   - data/synced/meta.json       — sync metadata (timestamp, counts)
 *
 * In production, the output would be PUT to a homeserver as PubkyAppPost / PubkyAppTag objects.
 * For now, the JSON files feed the frontend's adapter layer directly.
 *
 * Usage:
 *   npx tsx scripts/sync-bips.ts                    # full sync
 *   npx tsx scripts/sync-bips.ts --merged-only      # only merged BIPs
 *   npx tsx scripts/sync-bips.ts --prs-only         # only PRs
 *   npx tsx scripts/sync-bips.ts --limit 20         # limit items fetched
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const GITHUB_API = 'https://api.github.com'
const RAW_BASE = 'https://raw.githubusercontent.com/bitcoin/bips/master'
const REPO = 'bitcoin/bips'
const OUTPUT_DIR = path.resolve(__dirname, '../src/data/synced')
const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? ''

const MIRROR_PUBKY = 'pk:bip-mirror'

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
}

interface SyncedReview {
  id: string
  specId: string
  reviewerPubky: string
  label: string
  createdAt: number
  githubUser: string
  source: 'pr-comment'
}

interface AuthorInfo {
  githubLogin: string
  name: string
  bio: string
}

// --- GitHub API helpers ---

const headers: Record<string, string> = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'pubky-specs-sync/1.0',
}

if (GITHUB_TOKEN) {
  headers['Authorization'] = `token ${GITHUB_TOKEN}`
}

async function ghFetch(url: string): Promise<any> {
  const res = await fetch(url, { headers })
  if (res.status === 403) {
    const remaining = res.headers.get('x-ratelimit-remaining')
    if (remaining === '0') {
      const resetTime = parseInt(res.headers.get('x-ratelimit-reset') ?? '0', 10)
      const waitSec = Math.max(0, resetTime - Math.floor(Date.now() / 1000))
      console.warn(`\nRate limited. Resets in ${waitSec}s. Saving partial progress.`)
      throw new RateLimitError(waitSec)
    }
  }
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GitHub API ${res.status}: ${text.slice(0, 200)}`)
  }
  return res.json()
}

class RateLimitError extends Error {
  constructor(public waitSeconds: number) {
    super(`Rate limited. Wait ${waitSeconds}s.`)
  }
}

async function ghFetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'User-Agent': 'pubky-specs-sync/1.0' } })
  if (!res.ok) throw new Error(`Fetch ${res.status}: ${url}`)
  return res.text()
}

// --- BIP preamble parser ---

function parseBipPreamble(content: string): Record<string, string> {
  const preamble: Record<string, string> = {}
  const lines = content.split('\n')

  let inPreamble = false
  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed === '<pre>' || trimmed === '```') {
      inPreamble = true
      continue
    }
    if (trimmed === '</pre>' || (inPreamble && trimmed === '```')) {
      break
    }

    if (inPreamble || /^\s+(BIP|Layer|Title|Authors?|Status|Type|Assigned|License|Discussion|Requires|Replaces):/.test(line)) {
      inPreamble = true
      const match = line.match(/^\s*([\w-]+)\s*:\s*(.*)$/)
      if (match) {
        const key = match[1].trim().toLowerCase()
        const value = match[2].trim()
        preamble[key] = value
      }
    }

    if (!inPreamble && /^  BIP:/.test(line)) {
      inPreamble = true
      const match = line.match(/^\s*([\w-]+)\s*:\s*(.*)$/)
      if (match) {
        preamble[match[1].trim().toLowerCase()] = match[2].trim()
      }
    }
  }

  return preamble
}

function extractAbstract(content: string): string {
  const abstractPatterns = [
    /===\s*Abstract\s*===\s*\n+([\s\S]*?)(?=\n===|\n==)/i,
    /## Abstract\s*\n+([\s\S]*?)(?=\n##|\n#)/i,
    /==\s*Abstract\s*==\s*\n+([\s\S]*?)(?=\n==)/i,
  ]

  for (const pattern of abstractPatterns) {
    const match = content.match(pattern)
    if (match) {
      return match[1].trim().replace(/'''.*?'''/g, '').replace(/<[^>]+>/g, '').slice(0, 500)
    }
  }

  const firstParagraph = content
    .split('\n')
    .filter(l => l.trim() && !l.startsWith('=') && !l.startsWith('#') && !l.startsWith('<') && !l.startsWith(' '))
    .slice(0, 3)
    .join(' ')
    .slice(0, 300)

  return firstParagraph || 'No abstract available.'
}

function bipTypeToLabel(type: string): 'specification' | 'informational' | 'process' {
  const lower = type.toLowerCase()
  if (lower.includes('informational')) return 'informational'
  if (lower.includes('process')) return 'process'
  return 'specification'
}

function extractTopicTags(preamble: Record<string, string>, content: string): string[] {
  const tags: string[] = []

  if (preamble.layer) {
    const layer = preamble.layer.toLowerCase()
    if (layer.includes('consensus')) tags.push('consensus')
    if (layer.includes('peer')) tags.push('p2p')
    if (layer.includes('api') || layer.includes('rpc')) tags.push('api')
    if (layer.includes('application')) tags.push('applications')
  }

  const keywords: [RegExp, string][] = [
    [/wallet/i, 'wallet'],
    [/lightning|bolt|channel/i, 'lightning'],
    [/privacy|stealth|silent/i, 'privacy'],
    [/taproot|schnorr/i, 'taproot'],
    [/segwit/i, 'segwit'],
    [/psbt/i, 'psbt'],
    [/opcode|op_/i, 'opcodes'],
    [/covenant/i, 'covenants'],
    [/inscription|ordinal/i, 'ordinals'],
    [/payment/i, 'payments'],
    [/address/i, 'addresses'],
    [/key|derivation|hd/i, 'key-management'],
    [/mining|miner/i, 'mining'],
    [/transaction/i, 'transactions'],
    [/script/i, 'script'],
  ]

  const searchText = (preamble.title ?? '') + ' ' + content.slice(0, 2000)
  for (const [pattern, tag] of keywords) {
    if (pattern.test(searchText) && !tags.includes(tag)) {
      tags.push(tag)
    }
  }

  return tags.slice(0, 6)
}

// --- Sync merged BIPs ---

async function syncMergedBips(limit: number): Promise<{ specs: SyncedSpec[]; authors: Map<string, AuthorInfo> }> {
  console.log('Fetching BIP file list from repository...')

  const contents: any[] = await ghFetch(`${GITHUB_API}/repos/${REPO}/contents`)
  const bipFiles = contents
    .filter((f: any) => f.type === 'file' && /^bip-\d{4}\.(mediawiki|md)$/.test(f.name))
    .slice(0, limit)

  console.log(`Found ${bipFiles.length} BIP files (limit: ${limit})`)

  const specs: SyncedSpec[] = []
  const authors = new Map<string, AuthorInfo>()

  for (const file of bipFiles) {
    const bipNumMatch = file.name.match(/bip-(\d{4})/)
    if (!bipNumMatch) continue

    const bipNum = parseInt(bipNumMatch[1], 10)

    try {
      const content = await ghFetchText(file.download_url)
      const preamble = parseBipPreamble(content)
      const title = preamble.title ?? `BIP ${bipNum}`
      const abstract = extractAbstract(content)
      const type = bipTypeToLabel(preamble.type ?? 'Standards')
      const tags = extractTopicTags(preamble, content)

      const authorName = (preamble.authors ?? preamble.author ?? 'Unknown')
        .replace(/<[^>]+>/g, '')
        .split('\n')[0]
        .trim()

      const authorKey = `gh:${authorName.toLowerCase().replace(/\s+/g, '-')}`
      if (!authors.has(authorKey)) {
        authors.set(authorKey, {
          githubLogin: authorName,
          name: authorName,
          bio: `BIP ${bipNum} author.`,
        })
      }

      specs.push({
        id: `bip-${bipNum}`,
        namespace: 'bip',
        authorPubky: MIRROR_PUBKY,
        uri: `pubky://${MIRROR_PUBKY}/pub/pubky.app/posts/bip-${bipNum}`,
        title: `BIP ${bipNum}: ${title}`,
        summary: abstract,
        body: content.slice(0, 50000),
        typeLabel: type,
        topicTags: tags,
        createdAt: preamble.assigned ? `${preamble.assigned}T00:00:00Z` : '2009-01-03T00:00:00Z',
        updatedAt: new Date().toISOString(),
        revisionUris: [],
        discussionLinks: preamble.discussion
          ? preamble.discussion.split('\n').map((l: string) => {
              const urlMatch = l.match(/(https?:\/\/\S+)/)
              return urlMatch ? urlMatch[1] : ''
            }).filter(Boolean)
          : [],
        source: 'merged',
        sourceUrl: file.html_url,
        specNumber: bipNum,
        githubAuthor: authorName,
        status: preamble.status,
        layer: preamble.layer,
      })

      process.stdout.write(`.`)
    } catch (err) {
      console.error(`\nFailed to process ${file.name}: ${err}`)
    }
  }

  console.log(`\nProcessed ${specs.length} merged BIPs`)
  return { specs, authors }
}

// --- Sync PRs (open, closed, rejected) ---

async function syncPRs(limit: number): Promise<{ specs: SyncedSpec[]; reviews: SyncedReview[]; authors: Map<string, AuthorInfo> }> {
  console.log('Fetching BIP PRs...')

  const specs: SyncedSpec[] = []
  const reviews: SyncedReview[] = []
  const authors = new Map<string, AuthorInfo>()

  for (const state of ['open', 'closed'] as const) {
    const pages = Math.ceil(limit / 30)
    for (let page = 1; page <= pages; page++) {
      const prs: any[] = await ghFetch(
        `${GITHUB_API}/repos/${REPO}/pulls?state=${state}&per_page=30&page=${page}&sort=updated&direction=desc`
      )
      if (prs.length === 0) break

      for (const pr of prs) {
        const labels = (pr.labels ?? []).map((l: any) => l.name)
        const isNewBip = labels.includes('New BIP') || labels.includes('Process')
        const hasContent = pr.title && pr.body

        if (!isNewBip && !hasContent) continue

        const isMerged = pr.merged_at != null
        const source: SyncedSpec['source'] = isMerged
          ? 'merged'
          : state === 'open'
            ? 'open-pr'
            : labels.includes('New BIP')
              ? 'rejected-pr'
              : 'closed-pr'

        const authorLogin = pr.user?.login ?? 'unknown'
        const authorKey = `gh:${authorLogin}`
        if (!authors.has(authorKey)) {
          authors.set(authorKey, {
            githubLogin: authorLogin,
            name: authorLogin,
            bio: `GitHub user.`,
          })
        }

        const tags: string[] = labels
          .filter((l: string) => l !== 'New BIP' && l !== 'Process')
          .map((l: string) => l.toLowerCase().replace(/\s+/g, '-'))

        if (labels.includes('New BIP')) tags.push('new-bip')

        specs.push({
          id: `pr-${pr.number}`,
          namespace: 'bip',
          authorPubky: MIRROR_PUBKY,
          uri: `pubky://${MIRROR_PUBKY}/pub/pubky.app/posts/pr-${pr.number}`,
          title: pr.title,
          summary: (pr.body ?? '').replace(/\r\n/g, '\n').slice(0, 500),
          body: (pr.body ?? '').replace(/\r\n/g, '\n').slice(0, 50000),
          typeLabel: 'informational',
          topicTags: tags.slice(0, 6),
          createdAt: pr.created_at,
          updatedAt: pr.updated_at,
          revisionUris: [],
          discussionLinks: [pr.html_url],
          source,
          sourceUrl: pr.html_url,
          prNumber: pr.number,
          githubAuthor: authorLogin,
        })

        if (isNewBip) {
          try {
            const comments: any[] = await ghFetch(
              `${GITHUB_API}/repos/${REPO}/issues/${pr.number}/comments?per_page=100`
            )

            for (const comment of comments) {
              const stance = extractStanceFromComment(comment.body ?? '')
              if (!stance) continue

              const reviewerLogin = comment.user?.login ?? 'unknown'
              reviews.push({
                id: `rev-pr${pr.number}-${comment.id}`,
                specId: `pr-${pr.number}`,
                reviewerPubky: `pk:gh-${reviewerLogin}`,
                label: stance,
                createdAt: new Date(comment.created_at).getTime(),
                githubUser: reviewerLogin,
                source: 'pr-comment',
              })

              if (!authors.has(`gh:${reviewerLogin}`)) {
                authors.set(`gh:${reviewerLogin}`, {
                  githubLogin: reviewerLogin,
                  name: reviewerLogin,
                  bio: 'BIP reviewer on GitHub.',
                })
              }
            }
          } catch (err) {
            console.error(`Failed to fetch comments for PR #${pr.number}: ${err}`)
          }
        }

        process.stdout.write(`.`)
      }
    }
  }

  console.log(`\nProcessed ${specs.length} PRs, extracted ${reviews.length} reviews`)
  return { specs, reviews, authors }
}

function extractStanceFromComment(body: string): string | null {
  const lower = body.toLowerCase().trim()
  const lines = lower.split('\n').map(l => l.trim()).filter(Boolean)

  const stripped = lower
    .replace(/^>\s*.*/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .trim()

  if (/\b(concept[\s_-]?ack)\b/i.test(stripped)) return 'concept-ack'
  if (/\butack\b/i.test(stripped)) return 'ack'

  if (/\bnack\b/i.test(stripped)) return 'nack'
  if (/\bhard\s+nack\b/i.test(stripped)) return 'nack'

  if (/\back\b/i.test(stripped) && !/\bnack\b/i.test(stripped)) return 'ack'

  if (/\bneeds[\s_-]work\b/i.test(stripped)) return 'needs-work'

  for (const line of lines) {
    if (line.startsWith('>')) continue
    const clean = line.replace(/[*_`]/g, '').trim()
    if (/^(concept[\s_-]?)?ack\b/i.test(clean) && !/nack/i.test(clean)) {
      return clean.match(/concept/i) ? 'concept-ack' : 'ack'
    }
    if (/^nack\b/i.test(clean) || /^hard\s*nack\b/i.test(clean)) return 'nack'
    break
  }

  if (/\bfor\s+bip\s+(assignment|number)\b/i.test(stripped) && /\back\b/i.test(stripped)) {
    return 'concept-ack'
  }

  return null
}

// --- Main ---

async function main() {
  const args = process.argv.slice(2)
  const mergedOnly = args.includes('--merged-only')
  const prsOnly = args.includes('--prs-only')
  const limitArg = args.indexOf('--limit')
  const limit = limitArg >= 0 ? parseInt(args[limitArg + 1], 10) : 50

  console.log(`=== Pubky Specs BIP Sync ===`)
  console.log(`Mode: ${mergedOnly ? 'merged only' : prsOnly ? 'PRs only' : 'full'}`)
  console.log(`Limit: ${limit} items per source`)
  console.log(`Output: ${OUTPUT_DIR}`)
  if (!GITHUB_TOKEN) {
    console.log(`Warning: No GITHUB_TOKEN set. Rate limit is 60 requests/hour.`)
  }
  console.log()

  let allSpecs: SyncedSpec[] = []
  let allReviews: SyncedReview[] = []
  const allAuthors = new Map<string, AuthorInfo>()

  if (!prsOnly) {
    const merged = await syncMergedBips(limit)
    allSpecs.push(...merged.specs)
    for (const [k, v] of merged.authors) allAuthors.set(k, v)
  }

  if (!mergedOnly) {
    try {
      const prs = await syncPRs(limit)
      const existingIds = new Set(allSpecs.map(s => s.id))
      const newPrSpecs = prs.specs.filter(s => !existingIds.has(s.id))
      allSpecs.push(...newPrSpecs)
      allReviews.push(...prs.reviews)
      for (const [k, v] of prs.authors) allAuthors.set(k, v)
    } catch (err) {
      if (err instanceof RateLimitError) {
        console.log(`\nRate limited during PR sync. Saving what we have.`)
      } else {
        throw err
      }
    }
  }

  allSpecs.sort((a, b) => {
    if (a.specNumber && b.specNumber) return a.specNumber - b.specNumber
    if (a.specNumber) return -1
    if (b.specNumber) return 1
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'specs.json'),
    JSON.stringify(allSpecs, null, 2)
  )

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'reviews.json'),
    JSON.stringify(allReviews, null, 2)
  )

  const authorsObj = Object.fromEntries(allAuthors)
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'authors.json'),
    JSON.stringify(authorsObj, null, 2)
  )

  const meta = {
    syncedAt: new Date().toISOString(),
    mergedBips: allSpecs.filter(s => s.source === 'merged').length,
    openPrs: allSpecs.filter(s => s.source === 'open-pr').length,
    closedPrs: allSpecs.filter(s => s.source === 'closed-pr').length,
    rejectedPrs: allSpecs.filter(s => s.source === 'rejected-pr').length,
    totalSpecs: allSpecs.length,
    totalReviews: allReviews.length,
    totalAuthors: allAuthors.size,
    mirrorPubky: MIRROR_PUBKY,
  }
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'meta.json'),
    JSON.stringify(meta, null, 2)
  )

  console.log()
  console.log(`=== Sync Complete ===`)
  console.log(`Specs:   ${meta.totalSpecs} (${meta.mergedBips} merged, ${meta.openPrs} open PRs, ${meta.closedPrs} closed PRs, ${meta.rejectedPrs} rejected PRs)`)
  console.log(`Reviews: ${meta.totalReviews}`)
  console.log(`Authors: ${meta.totalAuthors}`)
  console.log(`Output:  ${OUTPUT_DIR}`)
}

main().catch(err => {
  console.error('Sync failed:', err)
  process.exit(1)
})

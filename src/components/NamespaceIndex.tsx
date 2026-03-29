'use client'

import { useState, useMemo, useCallback } from 'react'
import type { Spec } from '@/data/types'
import { TrustFilter } from '@/components/TrustFilter'
import { TagFilter } from '@/components/TagFilter'
import { SpecCard } from '@/components/SpecCard'
import { getReviewersByNamespace, getAllCollections, getTrustPresetsForNamespace } from '@/data/adapters'
import { rankSpecs, type SortMode } from '@/lib/ranking'

const PAGE_SIZE = 50

interface NamespaceIndexProps {
  namespace: string
  initialSpecs: Spec[]
}

export function NamespaceIndex({ namespace, initialSpecs }: NamespaceIndexProps) {
  const [sortMode, setSortMode] = useState<SortMode>('number')
  const [collectionId, setCollectionId] = useState<string | undefined>()
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const reviewers = getReviewersByNamespace(namespace)
  const hasReviewers = reviewers.length > 0
  const collections = getAllCollections()
  const presets = getTrustPresetsForNamespace(namespace)

  const [presetId, setPresetId] = useState('preset-all')
  const [activeReviewers, setActiveReviewers] = useState<string[]>(() =>
    reviewers.map(r => r.pubky)
  )

  function handlePresetChange(id: string) {
    setPresetId(id)
    const preset = presets.find(p => p.id === id)
    setActiveReviewers(preset?.includedReviewers ?? reviewers.map(r => r.pubky))
    setPage(1)
  }

  function handleToggleReviewer(pubky: string) {
    setActiveReviewers(prev =>
      prev.includes(pubky) ? prev.filter(p => p !== pubky) : [...prev, pubky]
    )
    setPresetId('')
    setPage(1)
  }

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }, [])

  const handleSortChange = useCallback((mode: SortMode) => {
    setSortMode(mode)
    setPage(1)
  }, [])

  const handleTagChange = useCallback((tag: string | null) => {
    setActiveTag(tag)
    setPage(1)
  }, [])

  const handleCollectionChange = useCallback((id: string | undefined) => {
    setCollectionId(id)
    setPage(1)
  }, [])

  const availableTags = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of initialSpecs) {
      for (const t of s.topicTags) {
        counts[t] = (counts[t] ?? 0) + 1
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }))
  }, [initialSpecs])

  const filtered = useMemo(() => {
    let specs = initialSpecs

    if (activeTag) {
      specs = specs.filter(s => s.topicTags.includes(activeTag))
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      specs = specs.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.topicTags.some(t => t.includes(q)) ||
        (s.specNumber != null && String(s.specNumber).includes(q))
      )
    }

    return rankSpecs(specs, sortMode, hasReviewers ? activeReviewers : undefined, collectionId)
  }, [initialSpecs, sortMode, activeReviewers, collectionId, search, activeTag, hasReviewers])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const availableSorts: SortMode[] = hasReviewers
    ? ['number', 'recent', 'engagement', 'implementations', 'controversial']
    : ['number', 'recent']

  return (
    <>
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search specs by title, tag, or number..."
          className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent placeholder:text-text-tertiary"
        />
      </div>

      <TagFilter tags={availableTags} activeTag={activeTag} onTagChange={handleTagChange} />

      {hasReviewers ? (
        <TrustFilter
          presets={presets}
          activePresetId={presetId}
          onPresetChange={handlePresetChange}
          reviewers={reviewers}
          activeReviewers={activeReviewers}
          onToggleReviewer={handleToggleReviewer}
          sortMode={sortMode}
          onSortChange={handleSortChange}
          collectionId={collectionId}
          collections={collections.map(c => ({ id: c.id, title: c.title }))}
          onCollectionChange={handleCollectionChange}
          availableSorts={availableSorts}
        />
      ) : (
        <div className="flex gap-1 mb-4 bg-surface rounded-lg p-1 border border-border">
          {availableSorts.map(mode => (
            <button
              key={mode}
              onClick={() => handleSortChange(mode)}
              className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                sortMode === mode
                  ? 'bg-surface-2 text-text-primary shadow-sm'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              {mode === 'number' ? 'By number' : 'Most recent'}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 text-xs text-text-tertiary italic mb-4 flex items-center justify-between">
        <span>
          {filtered.length} spec{filtered.length !== 1 ? 's' : ''}
          {filtered.length > PAGE_SIZE && ` · page ${page} of ${totalPages}`}
          {activeTag && <> · tag: {activeTag}</>}
          {hasReviewers && activeReviewers.length < reviewers.length && (
            <> · {activeReviewers.length}/{reviewers.length} reviewers</>
          )}
        </span>
      </div>

      <div className="space-y-3">
        {paged.map(({ spec, summary, explanation }) => (
          <SpecCard key={spec.id} spec={spec} summary={summary} explanation={explanation} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-text-tertiary">
            <p className="text-sm">No specs match the current filters.</p>
            <button
              onClick={() => { handlePresetChange('preset-all'); setSearch(''); setCollectionId(undefined); setActiveTag(null) }}
              className="mt-2 text-accent text-sm hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </>
  )
}

function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  const pages = buildPageNumbers(page, totalPages)

  return (
    <nav className="flex items-center justify-center gap-1 mt-6 pt-4 border-t border-border">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-text-secondary hover:text-text-primary hover:bg-surface-2"
      >
        Prev
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`gap-${i}`} className="px-1 text-text-tertiary text-xs">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`min-w-[2rem] px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              p === page
                ? 'bg-accent text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-text-secondary hover:text-text-primary hover:bg-surface-2"
      >
        Next
      </button>
    </nav>
  )
}

function buildPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = [1]

  if (current > 3) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('...')

  pages.push(total)
  return pages
}

'use client'

import { useState, useMemo } from 'react'
import type { Spec } from '@/data/types'
import { TrustFilter } from '@/components/TrustFilter'
import { TagFilter } from '@/components/TagFilter'
import { SpecCard } from '@/components/SpecCard'
import { getReviewersByNamespace, getAllCollections, getTrustPresetsForNamespace } from '@/data/adapters'
import { rankSpecs, type SortMode } from '@/lib/ranking'

interface NamespaceIndexProps {
  namespace: string
  initialSpecs: Spec[]
}

export function NamespaceIndex({ namespace, initialSpecs }: NamespaceIndexProps) {
  const [sortMode, setSortMode] = useState<SortMode>('number')
  const [collectionId, setCollectionId] = useState<string | undefined>()
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)

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
  }

  function handleToggleReviewer(pubky: string) {
    setActiveReviewers(prev =>
      prev.includes(pubky) ? prev.filter(p => p !== pubky) : [...prev, pubky]
    )
    setPresetId('')
  }

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

  const availableSorts: SortMode[] = hasReviewers
    ? ['number', 'recent', 'engagement', 'implementations', 'controversial']
    : ['number', 'recent']

  return (
    <>
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search specs by title, tag, or number..."
          className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent placeholder:text-text-tertiary"
        />
      </div>

      <TagFilter tags={availableTags} activeTag={activeTag} onTagChange={setActiveTag} />

      {hasReviewers ? (
        <TrustFilter
          presets={presets}
          activePresetId={presetId}
          onPresetChange={handlePresetChange}
          reviewers={reviewers}
          activeReviewers={activeReviewers}
          onToggleReviewer={handleToggleReviewer}
          sortMode={sortMode}
          onSortChange={setSortMode}
          collectionId={collectionId}
          collections={collections.map(c => ({ id: c.id, title: c.title }))}
          onCollectionChange={setCollectionId}
          availableSorts={availableSorts}
        />
      ) : (
        <div className="flex gap-1 mb-4 bg-surface rounded-lg p-1 border border-border">
          {availableSorts.map(mode => (
            <button
              key={mode}
              onClick={() => setSortMode(mode)}
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

      <div className="mt-4 text-xs text-text-tertiary italic mb-4">
        {filtered.length} spec{filtered.length !== 1 ? 's' : ''} shown.
        {activeTag && <> Filtered by tag: {activeTag}.</>}
        {hasReviewers && activeReviewers.length < reviewers.length && (
          <> Filtered to {activeReviewers.length} of {reviewers.length} reviewers.</>
        )}
      </div>

      <div className="space-y-3">
        {filtered.map(({ spec, summary, explanation }) => (
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
    </>
  )
}

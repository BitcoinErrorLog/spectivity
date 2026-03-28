'use client'

import { useState, useMemo } from 'react'
import type { Spec } from '@/data/types'
import { TrustFilter } from '@/components/TrustFilter'
import { SpecCard } from '@/components/SpecCard'
import { getAllReviewers, getAllCollections, getAllTrustPresets } from '@/data/adapters'
import { rankSpecs, type SortMode } from '@/lib/ranking'
import { resolvePreset } from '@/lib/trustPresets'

interface NamespaceIndexProps {
  namespace: string
  initialSpecs: Spec[]
}

export function NamespaceIndex({ namespace, initialSpecs }: NamespaceIndexProps) {
  const [presetId, setPresetId] = useState('preset-all')
  const [activeReviewers, setActiveReviewers] = useState<string[]>(() => resolvePreset('preset-all'))
  const [sortMode, setSortMode] = useState<SortMode>('engagement')
  const [collectionId, setCollectionId] = useState<string | undefined>()
  const [search, setSearch] = useState('')

  const reviewers = getAllReviewers()
  const collections = getAllCollections()
  const presets = getAllTrustPresets()

  function handlePresetChange(id: string) {
    setPresetId(id)
    setActiveReviewers(resolvePreset(id))
  }

  function handleToggleReviewer(pubky: string) {
    setActiveReviewers(prev =>
      prev.includes(pubky) ? prev.filter(p => p !== pubky) : [...prev, pubky]
    )
    setPresetId('')
  }

  const filtered = useMemo(() => {
    let specs = initialSpecs
    if (search.trim()) {
      const q = search.toLowerCase()
      specs = specs.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.topicTags.some(t => t.includes(q)) ||
        (s.specNumber != null && String(s.specNumber).includes(q))
      )
    }
    return rankSpecs(specs, sortMode, activeReviewers, collectionId)
  }, [initialSpecs, sortMode, activeReviewers, collectionId, search])

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
      />

      <div className="mt-4 text-xs text-text-tertiary italic mb-4">
        {filtered.length} spec{filtered.length !== 1 ? 's' : ''} shown.
        {activeReviewers.length < reviewers.length && (
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
              onClick={() => { handlePresetChange('preset-all'); setSearch(''); setCollectionId(undefined) }}
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

'use client'

import { cn } from '@/lib/cn'

interface TagFilterProps {
  tags: { tag: string; count: number }[]
  activeTag: string | null
  onTagChange: (tag: string | null) => void
}

export function TagFilter({ tags, activeTag, onTagChange }: TagFilterProps) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5 mb-4">
      <button
        onClick={() => onTagChange(null)}
        className={cn(
          'px-2.5 py-1 rounded-full text-xs font-medium transition-colors border',
          activeTag === null
            ? 'bg-accent text-white border-accent'
            : 'bg-surface-2 border-border text-text-tertiary hover:text-text-secondary'
        )}
      >
        All
      </button>
      {tags.map(({ tag, count }) => (
        <button
          key={tag}
          onClick={() => onTagChange(activeTag === tag ? null : tag)}
          className={cn(
            'px-2.5 py-1 rounded-full text-xs font-medium transition-colors border',
            activeTag === tag
              ? 'bg-accent text-white border-accent'
              : 'bg-surface-2 border-border text-text-tertiary hover:text-text-secondary'
          )}
        >
          {tag} <span className="opacity-60">{count}</span>
        </button>
      ))}
    </div>
  )
}

'use client'

import Link from 'next/link'
import { getImplementationsForSpec, getProjects, type Implementation } from '@/data/implementations'
import type { Spec } from '@/data/types'
import { getNamespace } from '@/data/types'
import { cn } from '@/lib/cn'

interface ImplementationMatrixProps {
  spec: Spec
}

const STATUS_STYLES: Record<string, string> = {
  full: 'bg-emerald-400/20 text-emerald-400',
  partial: 'bg-amber-400/20 text-amber-400',
  planned: 'bg-blue-400/20 text-blue-400',
  none: 'bg-surface-2 text-text-tertiary',
}

const STATUS_LABELS: Record<string, string> = {
  full: 'Full',
  partial: 'Partial',
  planned: 'Planned',
  none: '—',
}

export function ImplementationMatrix({ spec }: ImplementationMatrixProps) {
  const implementations = getImplementationsForSpec(spec.id)
  const projects = getProjects()

  if (implementations.length === 0 || implementations.every(i => i.status === 'none')) {
    return (
      <div className="text-sm text-text-tertiary italic py-4 text-center">
        No implementation data available for this spec.
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">Implementation Status</h3>
        <p className="text-xs text-text-tertiary mt-0.5">Which projects support this spec</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4">
        {implementations
          .filter(impl => impl.status !== 'none')
          .map(impl => (
            <a
              key={impl.project}
              href={impl.url}
              target="_blank"
              rel="noopener"
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-opacity hover:opacity-80',
                STATUS_STYLES[impl.status]
              )}
            >
              <span className="w-2 h-2 rounded-full bg-current flex-shrink-0" />
              <span className="flex-1">{impl.project}</span>
              <span className="opacity-70">{STATUS_LABELS[impl.status]}</span>
            </a>
          ))}
      </div>
      <div className="px-4 py-2 border-t border-border flex gap-4 text-[0.65rem] text-text-tertiary">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Full support</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Partial</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Planned</span>
      </div>
    </div>
  )
}

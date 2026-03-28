'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { getAllSpecs } from '@/data/adapters'
import { getNamespace, type Spec } from '@/data/types'
import { cn } from '@/lib/cn'

interface DependencyGraphProps {
  spec: Spec
}

interface DepLink {
  from: { id: string; title: string; namespace: string; specNumber?: number }
  to: { id: string; title: string; namespace: string; specNumber?: number }
  type: 'requires' | 'replaces'
}

export function DependencyGraph({ spec }: DependencyGraphProps) {
  const allSpecs = getAllSpecs()

  const links = useMemo(() => {
    const result: DepLink[] = []
    const specMap = new Map(allSpecs.map(s => [s.id, s]))

    function findSpec(ref: string, namespace: string): Spec | undefined {
      const nums = ref.split(/[,\s]+/).filter(Boolean)
      for (const n of nums) {
        const num = parseInt(n.trim(), 10)
        if (isNaN(num)) continue
        const found = allSpecs.find(s => s.namespace === namespace && s.specNumber === num)
        if (found) return found
      }
      return undefined
    }

    if (spec.requires) {
      const refs = spec.requires.split(/[,\s]+/).filter(Boolean)
      for (const ref of refs) {
        const target = findSpec(ref, spec.namespace)
        if (target) {
          result.push({
            from: { id: spec.id, title: spec.title, namespace: spec.namespace, specNumber: spec.specNumber },
            to: { id: target.id, title: target.title, namespace: target.namespace, specNumber: target.specNumber },
            type: 'requires',
          })
        }
      }
    }

    if (spec.replaces) {
      const refs = spec.replaces.split(/[,\s]+/).filter(Boolean)
      for (const ref of refs) {
        const target = findSpec(ref, spec.namespace)
        if (target) {
          result.push({
            from: { id: spec.id, title: spec.title, namespace: spec.namespace, specNumber: spec.specNumber },
            to: { id: target.id, title: target.title, namespace: target.namespace, specNumber: target.specNumber },
            type: 'replaces',
          })
        }
      }
    }

    for (const other of allSpecs) {
      if (other.id === spec.id) continue
      if (other.requires) {
        const specNum = String(spec.specNumber ?? '')
        if (specNum && other.namespace === spec.namespace && other.requires.split(/[,\s]+/).includes(specNum)) {
          result.push({
            from: { id: other.id, title: other.title, namespace: other.namespace, specNumber: other.specNumber },
            to: { id: spec.id, title: spec.title, namespace: spec.namespace, specNumber: spec.specNumber },
            type: 'requires',
          })
        }
      }
      if (other.replaces) {
        const specNum = String(spec.specNumber ?? '')
        if (specNum && other.namespace === spec.namespace && other.replaces.split(/[,\s]+/).includes(specNum)) {
          result.push({
            from: { id: other.id, title: other.title, namespace: other.namespace, specNumber: other.specNumber },
            to: { id: spec.id, title: spec.title, namespace: spec.namespace, specNumber: spec.specNumber },
            type: 'replaces',
          })
        }
      }
    }

    return result
  }, [spec, allSpecs])

  if (links.length === 0) return null

  const ns = getNamespace(spec.namespace)

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <h3 className="text-sm font-semibold text-text-primary mb-3">Related Specs</h3>
      <div className="space-y-2">
        {links.map((link, i) => {
          const isOutgoing = link.from.id === spec.id
          const other = isOutgoing ? link.to : link.from
          const otherNs = getNamespace(other.namespace)

          return (
            <Link
              key={i}
              href={`/${other.namespace}/${other.specNumber ?? other.id}`}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-2 transition-colors"
            >
              <span className={cn(
                'text-[0.6rem] font-semibold px-1.5 py-0.5 rounded',
                link.type === 'requires' ? 'bg-blue-400/15 text-blue-400' : 'bg-amber-400/15 text-amber-400'
              )}>
                {isOutgoing
                  ? (link.type === 'requires' ? 'Requires' : 'Replaces')
                  : (link.type === 'requires' ? 'Required by' : 'Replaced by')
                }
              </span>
              <span
                className="text-[0.6rem] font-bold px-1.5 py-0.5 rounded"
                style={{ backgroundColor: otherNs.color + '20', color: otherNs.color }}
              >
                {otherNs.label} {other.specNumber}
              </span>
              <span className="text-sm text-text-secondary flex-1 min-w-0 truncate">
                {other.title}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

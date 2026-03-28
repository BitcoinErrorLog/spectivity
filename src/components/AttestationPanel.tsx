import type { Attestation } from '@/data/types'
import { getAuthor } from '@/data/adapters'
import { cn } from '@/lib/cn'

interface AttestationPanelProps {
  attestations: Attestation[]
}

const TYPE_STYLES: Record<string, string> = {
  'implemented': 'bg-emerald-400/15 border-emerald-400/30 text-emerald-400',
  'deployed': 'bg-blue-400/15 border-blue-400/30 text-blue-400',
  'in-progress': 'bg-amber-400/15 border-amber-400/30 text-amber-400',
  'supports': 'bg-emerald-400/15 border-emerald-400/30 text-emerald-400',
  'opposes': 'bg-red-400/15 border-red-400/30 text-red-400',
  'compatible': 'bg-blue-400/15 border-blue-400/30 text-blue-400',
  'incompatible': 'bg-red-400/15 border-red-400/30 text-red-400',
}

export function AttestationPanel({ attestations }: AttestationPanelProps) {
  if (attestations.length === 0) {
    return (
      <div className="text-sm text-text-tertiary italic py-4 text-center">
        No implementation evidence reported.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {attestations.map(att => {
        const author = getAuthor(att.attestorPubky)
        return (
          <div
            key={att.id}
            className="bg-surface-2 border border-border rounded-lg p-3"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className={cn(
                'text-[0.65rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border',
                TYPE_STYLES[att.attestationType] ?? 'bg-surface-3 text-text-tertiary'
              )}>
                {att.attestationType.replace(/-/g, ' ')}
              </span>
              <span className="text-xs text-text-tertiary">
                {author?.name ?? att.attestorPubky.slice(0, 16)}
              </span>
            </div>
            <p className="text-sm text-text-secondary">{att.statement}</p>
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="text-text-tertiary">{att.subject}</span>
              <a
                href={att.evidenceLink}
                target="_blank"
                rel="noopener"
                className="text-accent hover:underline"
                onClick={e => e.stopPropagation()}
              >
                View evidence
              </a>
            </div>
          </div>
        )
      })}
    </div>
  )
}

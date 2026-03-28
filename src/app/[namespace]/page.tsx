import type { Metadata } from 'next'
import { getNamespace, NAMESPACES } from '@/data/types'
import { getSpecsByNamespace } from '@/data/adapters'
import { NamespaceIndex } from '@/components/NamespaceIndex'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ namespace: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { namespace } = await params
  const ns = NAMESPACES.find(n => n.id === namespace)
  if (!ns) return {}
  return {
    title: `${ns.fullName} (${ns.label}s)`,
    description: ns.description,
  }
}

export function generateStaticParams() {
  return NAMESPACES.filter(n => n.id !== 'other').map(n => ({ namespace: n.id }))
}

export default async function NamespacePage({ params }: Props) {
  const { namespace } = await params
  const ns = NAMESPACES.find(n => n.id === namespace)
  if (!ns) notFound()

  const specs = getSpecsByNamespace(namespace)

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span
            className="text-sm font-bold px-3 py-1 rounded"
            style={{ backgroundColor: ns.color + '20', color: ns.color }}
          >
            {ns.label}
          </span>
          <h1 className="font-display text-2xl font-bold">{ns.fullName}</h1>
        </div>
        <p className="text-sm text-text-secondary">{ns.description}</p>
        <p className="text-xs text-text-tertiary mt-1">{specs.length} specs indexed{ns.repo ? ` from ${ns.repo}` : ''}</p>
      </div>
      <NamespaceIndex namespace={namespace} initialSpecs={specs} />
    </div>
  )
}

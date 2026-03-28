import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSpecByNamespaceAndId } from '@/data/adapters'
import { getNamespace } from '@/data/types'
import { SpecDetailView } from '@/components/SpecDetailView'

interface Props {
  params: Promise<{ namespace: string; specId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { namespace, specId } = await params
  const spec = getSpecByNamespaceAndId(namespace, specId)
  if (!spec) return {}
  const ns = getNamespace(namespace)
  return {
    title: spec.title,
    description: spec.summary,
    openGraph: {
      title: `${spec.title} | Spectivity`,
      description: spec.summary,
      type: 'article',
      url: `https://spectivity.io/${namespace}/${specId}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${ns.label} ${spec.specNumber ?? ''}: ${spec.title}`,
      description: spec.summary,
    },
  }
}

export default async function SpecPage({ params }: Props) {
  const { namespace, specId } = await params
  const spec = getSpecByNamespaceAndId(namespace, specId)
  if (!spec) notFound()

  return <SpecDetailView spec={spec} />
}

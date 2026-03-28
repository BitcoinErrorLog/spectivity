import type { Metadata } from 'next'
import FAQ from './FaqContent'

export const metadata: Metadata = {
  title: 'FAQ — How Does This Work?',
  description: 'The hard questions a protocol developer would ask about Spectivity, answered with concrete mechanism details.',
}

export default function FaqPage() {
  return <FAQ />
}

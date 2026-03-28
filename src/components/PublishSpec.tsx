'use client'
import { useState } from 'react'
import { publishSpec, type PublishSpecInput } from '@/lib/publish'
import { cn } from '@/lib/cn'

interface PublishSpecProps {
  authorPubky: string
  onPublished?: (uri: string) => void
}

export function PublishSpec({ authorPubky, onPublished }: PublishSpecProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [body, setBody] = useState('')
  const [typeLabel, setTypeLabel] = useState('informational')
  const [tagsInput, setTagsInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !summary.trim() || !body.trim()) return

    setSubmitting(true)
    const input: PublishSpecInput = {
      title: title.trim(),
      summary: summary.trim(),
      body: body.trim(),
      typeLabel,
      topicTags: tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
    }

    const result = await publishSpec(authorPubky, input)

    if (result.success) {
      onPublished?.(result.uri)
      setTitle('')
      setSummary('')
      setBody('')
      setTagsInput('')
      setIsOpen(false)
    }
    setSubmitting(false)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
      >
        Publish a Spec
      </button>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-base">Publish a Spec</h3>
        <button onClick={() => setIsOpen(false)} className="text-text-tertiary hover:text-text-secondary text-sm">
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-xs text-text-tertiary block mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
            placeholder="Proposal title"
          />
        </div>

        <div>
          <label className="text-xs text-text-tertiary block mb-1">Summary</label>
          <input
            type="text"
            value={summary}
            onChange={e => setSummary(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
            placeholder="One-line summary"
          />
        </div>

        <div>
          <label className="text-xs text-text-tertiary block mb-1">Body</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={8}
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent resize-y font-mono"
            placeholder="Full specification text (Markdown)"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-text-tertiary block mb-1">Type</label>
            <select
              value={typeLabel}
              onChange={e => setTypeLabel(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-secondary outline-none focus:border-accent"
            >
              <option value="informational">Informational</option>
              <option value="specification">Specification</option>
              <option value="process">Process</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs text-text-tertiary block mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
              placeholder="wallet, privacy"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-[0.65rem] text-text-tertiary">
            Writes PubkyAppPost to your homeserver + tags it with spec-proposal.
          </p>
          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              submitting || !title.trim()
                ? 'bg-surface-3 text-text-tertiary cursor-not-allowed'
                : 'bg-accent text-white hover:bg-accent-hover'
            )}
          >
            {submitting ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </form>
    </div>
  )
}

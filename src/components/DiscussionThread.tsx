'use client'

import { useState } from 'react'
import { getTopLevelDiscussions, getReplies, type Discussion } from '@/data/discussions'
import { cn } from '@/lib/cn'

interface DiscussionThreadProps {
  specId: string
  specTitle: string
}

export function DiscussionThread({ specId, specTitle }: DiscussionThreadProps) {
  const topLevel = getTopLevelDiscussions(specId)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">
          Discussion ({topLevel.length} thread{topLevel.length !== 1 ? 's' : ''})
        </h3>
        <button
          onClick={() => setReplyTo('top')}
          className="px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent-hover transition-colors"
        >
          New comment
        </button>
      </div>

      {replyTo === 'top' && (
        <div className="bg-surface border border-border rounded-xl p-4 mb-4">
          <textarea
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            rows={3}
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent resize-y placeholder:text-text-tertiary"
            placeholder={`Comment on ${specTitle}...`}
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-[0.65rem] text-text-tertiary">
              Sign in with GitHub to post. Comments are signed PubkyAppPost objects.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setReplyTo(null); setReplyText('') }}
                className="px-3 py-1.5 text-xs text-text-tertiary hover:text-text-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => { setReplyTo(null); setReplyText('') }}
                className="px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent-hover transition-colors"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {topLevel.length === 0 ? (
        <div className="text-center py-12 text-text-tertiary">
          <p className="text-sm">No discussion yet. Be the first to comment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topLevel.map(disc => (
            <DiscussionPost
              key={disc.id}
              discussion={disc}
              depth={0}
              replyTo={replyTo}
              setReplyTo={setReplyTo}
              replyText={replyText}
              setReplyText={setReplyText}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function DiscussionPost({
  discussion,
  depth,
  replyTo,
  setReplyTo,
  replyText,
  setReplyText,
}: {
  discussion: Discussion
  depth: number
  replyTo: string | null
  setReplyTo: (id: string | null) => void
  replyText: string
  setReplyText: (text: string) => void
}) {
  const replies = getReplies(discussion.id)
  const initials = discussion.authorName
    .split(/[\s-]/)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className={cn(depth > 0 && 'ml-6 pl-4 border-l border-border')}>
      <div className="bg-surface border border-border rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-text-secondary flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-text-primary">{discussion.authorName}</span>
              <span className="text-xs text-text-tertiary">
                {new Date(discussion.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{discussion.body}</p>
            <button
              onClick={() => setReplyTo(discussion.id)}
              className="text-xs text-text-tertiary hover:text-accent mt-2 transition-colors"
            >
              Reply
            </button>
          </div>
        </div>
      </div>

      {replyTo === discussion.id && (
        <div className="ml-11 mt-2 bg-surface border border-border rounded-xl p-3">
          <textarea
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            rows={2}
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent resize-y placeholder:text-text-tertiary"
            placeholder={`Reply to ${discussion.authorName}...`}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={() => { setReplyTo(null); setReplyText('') }} className="px-3 py-1 text-xs text-text-tertiary">Cancel</button>
            <button onClick={() => { setReplyTo(null); setReplyText('') }} className="px-3 py-1 bg-accent text-white rounded text-xs font-medium hover:bg-accent-hover">Reply</button>
          </div>
        </div>
      )}

      {depth < 2 && replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {replies.map(reply => (
            <DiscussionPost
              key={reply.id}
              discussion={reply}
              depth={depth + 1}
              replyTo={replyTo}
              setReplyTo={setReplyTo}
              replyText={replyText}
              setReplyText={setReplyText}
            />
          ))}
        </div>
      )}
    </div>
  )
}

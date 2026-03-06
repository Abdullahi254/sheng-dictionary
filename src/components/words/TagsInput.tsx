'use client'

import { useState, useEffect, KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Fallback ─────────────────────────────────────────────────────────────────

const FALLBACK_TAGS = [
  'money',
  'greetings',
  'food',
  'insults',
  'relationships',
  'street',
  'police',
  'school',
  'transport',
  'music',
  'fashion',
  'substances',
  'emotions',
  'friends',
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface TagsInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TagsInput({
  value,
  onChange,
  placeholder = 'Add a tag…',
  maxTags = 10,
  className,
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch dynamic tags on mount
  useEffect(() => {
    let cancelled = false

    async function fetchTags() {
      try {
        const res = await fetch('/api/tags')
        if (!res.ok) throw new Error('non-ok response')
        const data = (await res.json()) as { success: boolean; data?: string[] }
        if (!cancelled && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setSuggestions(data.data)
        } else if (!cancelled) {
          setSuggestions(FALLBACK_TAGS)
        }
      } catch {
        if (!cancelled) setSuggestions(FALLBACK_TAGS)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void fetchTags()
    return () => { cancelled = true }
  }, [])

  // ── Helpers ────────────────────────────────────────────────────────────────

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase()
    if (!tag || value.includes(tag) || value.length >= maxTags) return
    onChange([...value, tag])
    setInputValue('')
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      removeTag(value[value.length - 1])
    }
  }

  // Suggestions not already selected
  const availableSuggestions = suggestions.filter((s) => !value.includes(s))

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={cn('space-y-3', className)}>
      {/* Input + selected tags */}
      <div
        className={cn(
          'flex flex-wrap gap-1.5 min-h-[48px] px-3 py-2',
          'bg-white/5 border border-white/8 rounded-xl',
          'transition-all duration-200',
          'focus-within:border-[#c8f135]/30 focus-within:bg-white/6',
        )}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#c8f135]/10 border border-[#c8f135]/20 rounded-lg text-[#c8f135] text-xs font-mono"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-white transition-colors"
              aria-label={`Remove tag ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {value.length < maxTags && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => { if (inputValue) addTag(inputValue) }}
            placeholder={value.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/60 font-body py-0.5"
          />
        )}
      </div>

      {/* Suggestion pills */}
      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {loading ? (
          // Skeleton shimmer
          Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="h-7 rounded-lg bg-white/5 animate-pulse"
              style={{ width: `${52 + (i % 3) * 18}px` }}
              aria-hidden
            />
          ))
        ) : (
          availableSuggestions.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              disabled={value.length >= maxTags}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-mono',
                'border border-white/10 text-muted-foreground/70',
                'hover:border-[#c8f135]/30 hover:text-[#c8f135] hover:bg-[#c8f135]/5',
                'transition-all duration-150',
                'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-white/10 disabled:hover:text-muted-foreground/70 disabled:hover:bg-transparent',
              )}
            >
              + {tag}
            </button>
          ))
        )}
      </div>

      {value.length >= maxTags && (
        <p className="text-muted-foreground/60 text-[11px] font-mono">
          Max {maxTags} tags reached.
        </p>
      )}
    </div>
  )
}
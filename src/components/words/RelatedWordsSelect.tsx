'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, ChevronDown, Loader2 } from 'lucide-react'

interface WordOption {
  word: string
  slug: string
}

interface RelatedWordsSelectProps {
  value: string[]        // array of slugs
  onChange: (slugs: string[]) => void
  excludeSlug?: string   // slug of the word being submitted (to avoid self-reference)
}

export function RelatedWordsSelect({ value, onChange, excludeSlug }: RelatedWordsSelectProps) {
  const [allWords, setAllWords] = useState<WordOption[]>([])
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch approved words once
  useEffect(() => {
    setLoading(true)
    fetch('/api/words')
      .then((r) => r.json())
      .then((data: { success: boolean; data?: WordOption[] }) => {
        if (data.success && data.data) setAllWords(data.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = allWords.filter((w) => {
    if (excludeSlug && w.slug === excludeSlug) return false
    if (value.includes(w.slug)) return false
    if (!query.trim()) return true
    return w.word.toLowerCase().includes(query.toLowerCase())
  })

  function select(slug: string) {
    onChange([...value, slug])
    setQuery('')
  }

  function remove(slug: string) {
    onChange(value.filter((s) => s !== slug))
  }

  const selectedWords = allWords.filter((w) => value.includes(w.slug))

  return (
    <div ref={containerRef} className="relative">
      {/* Selected pills */}
      {selectedWords.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedWords.map((w) => (
            <span
              key={w.slug}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#c8f135]/10 border border-[#c8f135]/25 text-[#c8f135] text-xs font-mono rounded-lg"
            >
              {w.word}
              <button
                type="button"
                onClick={() => remove(w.slug)}
                className="hover:text-white transition-colors"
                aria-label={`Remove ${w.word}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Trigger / search input */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="
          w-full h-12 px-4 flex items-center justify-between gap-2
          bg-white/5 border border-white/8 rounded-xl
          text-sm font-body text-left
          transition-all duration-200
          hover:border-white/15
          focus:outline-none focus:border-[#c8f135]/30 focus:bg-white/6
        "
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={value.length === 0 ? 'text-muted-foreground/60' : 'text-foreground'}>
          {value.length === 0 ? 'Search and select words…' : `${value.length} word${value.length !== 1 ? 's' : ''} selected`}
        </span>
        {loading ? (
          <Loader2 className="w-4 h-4 text-muted-foreground/60 animate-spin shrink-0" />
        ) : (
          <ChevronDown className={`w-4 h-4 text-muted-foreground/60 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full mt-1.5 w-full bg-[#111111] border border-white/10 rounded-xl overflow-hidden shadow-xl">
          {/* Search inside dropdown */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/8">
            <Search className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to filter…"
              className="flex-1 bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground/60 outline-none"
            />
          </div>

          {/* Options list */}
          <ul role="listbox" className="max-h-52 overflow-y-auto py-1">
            {loading && (
              <li className="px-4 py-3 text-xs font-mono text-muted-foreground/60 text-center">
                Loading words…
              </li>
            )}
            {!loading && filtered.length === 0 && (
              <li className="px-4 py-3 text-xs font-mono text-muted-foreground/60 text-center">
                {query ? 'No matches found.' : 'No more words to add.'}
              </li>
            )}
            {filtered.map((w) => (
              <li key={w.slug}>
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => select(w.slug)}
                  className="
                    w-full px-4 py-2.5 text-left text-sm font-body
                    text-foreground/80 hover:text-foreground hover:bg-white/5
                    transition-colors duration-100
                  "
                >
                  {w.word}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

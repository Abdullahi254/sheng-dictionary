'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import type { PartOfSpeech } from '@/types'

const POS_OPTIONS: PartOfSpeech[] = ['noun', 'verb', 'adjective', 'expression', 'adverb']

interface FilterBarProps {
  tags: string[]
  total: number
}

export function FilterBar({ tags, total }: FilterBarProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const currentQ = searchParams.get('q') ?? ''
  const currentPos = searchParams.get('pos') ?? ''
  const currentTag = searchParams.get('tag') ?? ''

  const [query, setQuery] = useState(currentQ)
  const [isScrolled, setIsScrolled] = useState(false)

  // Collapse pills when the browse header scrolls out of view.
  // IntersectionObserver avoids the scroll-anchor oscillation that a scrollY
  // threshold causes (collapsing the bar shifts content, which changes scrollY,
  // which re-expands the bar — infinite loop).
  useEffect(() => {
    const sentinel = document.getElementById('browse-header-sentinel')
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsScrolled(!entry.isIntersecting),
      { threshold: 0 },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  function buildUrl(overrides: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(overrides)) {
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }
    params.delete('page')
    const qs = params.toString()
    return `/browse${qs ? `?${qs}` : ''}`
  }

  function handleSearch(e: { preventDefault(): void }) {
    e.preventDefault()
    router.push(buildUrl({ q: query.trim() || null }))
  }

  function togglePos(pos: PartOfSpeech) {
    router.push(buildUrl({ pos: pos === currentPos ? null : pos }))
  }

  function toggleTag(tag: string) {
    router.push(buildUrl({ tag: tag === currentTag ? null : tag }))
  }

  const hasFilters = Boolean(currentQ || currentPos || currentTag)
  const activeFilterCount = [currentQ, currentPos, currentTag].filter(Boolean).length

  return (
    <div className={`transition-all duration-300 ${isScrolled ? 'py-2' : 'py-5'}`}>
      {/* ── Always-visible row: search + filter badge ── */}
      <div className="flex items-center gap-2">
        <form onSubmit={handleSearch} className="relative flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/80 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search words, definitions..."
              autoComplete="off"
              spellCheck={false}
              className={`
                w-full pl-10 pr-4
                bg-white/5 border border-white/8
                rounded-xl text-sm text-foreground
                placeholder:text-muted-foreground/80
                outline-none font-body
                transition-all duration-300
                focus:border-[#c8f135]/30 focus:bg-white/6
                ${isScrolled ? 'h-8 text-xs' : 'h-10'}
              `}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  router.push(buildUrl({ q: null }))
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-foreground/80 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className={`
              shrink-0 bg-[#c8f135] text-black
              font-display font-bold uppercase tracking-wider
              rounded-xl hover:bg-[#d4f545] active:scale-95
              transition-all duration-150 disabled:opacity-50
              ${isScrolled ? 'h-8 px-3 text-[10px]' : 'h-10 px-4 text-xs'}
            `}
            disabled={!query.trim() && !currentQ}
          >
            Search
          </button>
        </form>

        {/* Compact active-filter indicator — only when scrolled + filters active */}
        {isScrolled && hasFilters && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="flex items-center gap-1 font-mono text-[10px] tracking-wider uppercase text-[#c8f135] border border-[#c8f135]/30 rounded-full px-2.5 py-1">
              <SlidersHorizontal className="w-3 h-3" />
              {activeFilterCount}
            </span>
            <button
              onClick={() => router.push('/browse')}
              className="text-muted-foreground/80 hover:text-[#c8f135] transition-colors"
              title="Clear all filters"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── Expandable: pills — hidden when scrolled ── */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isScrolled ? 'max-h-0 opacity-0 mt-0' : 'max-h-64 opacity-100 mt-4'
        }`}
      >
        <div className="space-y-3">
          {/* Part-of-speech pills */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground/80 shrink-0">
              Filter:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POS_OPTIONS.map((pos) => (
                <button
                  key={pos}
                  onClick={() => togglePos(pos)}
                  className={`
                    px-3 py-1 rounded-full text-[10px] font-mono tracking-[0.2em] uppercase border transition-all duration-150
                    ${currentPos === pos
                      ? 'bg-[#c8f135] border-[#c8f135] text-black'
                      : 'border-white/10 text-muted-foreground/80 hover:border-white/20 hover:text-foreground/80'
                    }
                  `}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Tag pills */}
          {tags.length > 0 && (
            <div className="flex items-center gap-x-4">
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground/80 shrink-0">
                Tags:
              </span>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`
                      px-2.5 py-0.5 rounded-full text-[10px] font-mono border transition-all duration-150
                      ${currentTag === tag
                        ? 'bg-[#c8f135]/15 border-[#c8f135]/40 text-[#c8f135]'
                        : 'border-white/8 text-muted-foreground/80 hover:border-white/15 hover:text-foreground/80'
                      }
                    `}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active filter summary */}
          {hasFilters && (
            <div className="flex items-center justify-between pt-1">
              <p className="font-mono text-[11px] text-muted-foreground/80">
                {total.toLocaleString()} {total === 1 ? 'word' : 'words'} found
              </p>
              <button
                onClick={() => router.push('/browse')}
                className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase text-muted-foreground/80 hover:text-[#c8f135] transition-colors"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

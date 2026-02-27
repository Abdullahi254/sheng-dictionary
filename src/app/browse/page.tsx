import { Suspense } from 'react'
import type { Metadata } from 'next'

import { Navbar } from '@/components/shared/Navbar'
import { WordsGrid } from '@/components/words/WordsGrid'
import { FilterBar } from '@/components/browse/FilterBar'
import { BrowsePagination } from '@/components/browse/BrowsePagination'
import AdUnit from '@/components/shared/AdUnit'
import connectToDatabase from '@/lib/mongodb'
import Word from '@/models/Word'
import type { IWord, PartOfSpeech } from '@/types'

// ─── ISR: revalidate every 5 minutes ─────────────────────────────────────────
export const revalidate = 300

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Browse Sheng Words | Sheng Dictionary',
  description:
    'Browse all Sheng words A to Z. Filter by part of speech and tag. The definitive Nairobi street slang dictionary.',
  alternates: { canonical: '/browse' },
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 20

const VALID_POS = new Set<string>(['noun', 'verb', 'adjective', 'expression', 'adverb'])

// ─── Types ────────────────────────────────────────────────────────────────────
type Props = {
  searchParams: Promise<{ q?: string; pos?: string; tag?: string; page?: string }>
}

// ─── Data fetching ────────────────────────────────────────────────────────────
async function getBrowseData(params: {
  q: string
  pos: string
  tag: string
  page: number
}): Promise<{ words: IWord[]; total: number; totalPages: number; allTags: string[] }> {
  const query: Record<string, unknown> = { status: 'approved' }

  if (params.q) {
    query.$or = [
      { word: { $regex: params.q, $options: 'i' } },
      { 'definitions.meaning': { $regex: params.q, $options: 'i' } },
    ]
  }

  if (params.pos && VALID_POS.has(params.pos)) {
    query.partOfSpeech = params.pos as PartOfSpeech
  }

  if (params.tag) {
    query.tags = { $in: [params.tag] }
  }

  const skip = (params.page - 1) * PAGE_SIZE

  const [wordDocs, total, tagList] = await Promise.all([
    Word.find(query).sort({ word: 1 }).skip(skip).limit(PAGE_SIZE).lean(),
    Word.countDocuments(query),
    Word.distinct('tags', { status: 'approved' }),
  ])

  return {
    words: JSON.parse(JSON.stringify(wordDocs)) as IWord[],
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
    allTags: (tagList as string[]).sort(),
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function BrowsePage({ searchParams }: Props) {
  const sp = await searchParams

  const q = (sp.q ?? '').trim()
  const pos = VALID_POS.has(sp.pos ?? '') ? (sp.pos ?? '') : ''
  const tag = sp.tag ?? ''
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)

  await connectToDatabase()
  const { words, total, totalPages, allTags } = await getBrowseData({ q, pos, tag, page })

  const isFiltered = Boolean(q || pos || tag)

  // Base params for pagination links (no 'page' key)
  const baseParams: Record<string, string> = {}
  if (q) baseParams.q = q
  if (pos) baseParams.pos = pos
  if (tag) baseParams.tag = tag

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── MASTHEAD ──────────────────────────────────────────────────── */}
      <header className="border-b border-white/5 pt-28 pb-12">
        {/* Sentinel observed by FilterBar to trigger collapse without scrollY thrashing */}
        <div id="browse-header-sentinel" aria-hidden />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Zine-style label row */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-7 bg-[#c8f135] rounded-full shrink-0" />
              <span className="font-mono text-[10px] tracking-[0.5em] uppercase text-muted-foreground/80">
                The Sheng Archive
              </span>
            </div>
            <span className="hidden sm:block font-mono text-[10px] tracking-wider text-muted-foreground/80">
              Nairobi · Kenya
            </span>
          </div>

          {/* Big count headline */}
          <h1
            className="font-display font-black uppercase leading-none tracking-tight"
            style={{ fontSize: 'clamp(52px, 9vw, 120px)' }}
          >
            {total.toLocaleString()}
            <span className="text-[#c8f135]">
              {isFiltered ? ' Found' : ' Words'}
            </span>
          </h1>

          <p className="font-mono text-[11px] tracking-wider uppercase text-muted-foreground/80 mt-3">
            {isFiltered
              ? `Filtered from the archive — ${totalPages} page${totalPages !== 1 ? 's' : ''}`
              : 'From the streets of Nairobi — sorted A to Z'}
          </p>
        </div>
      </header>

      {/* ── FILTER BAR ────────────────────────────────────────────────── */}
      <div className="border-b border-white/5 bg-background/80 backdrop-blur-sm sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Suspense fallback={<FilterBarSkeleton />}>
            <FilterBar tags={allTags} total={total} />
          </Suspense>
        </div>
      </div>

      {/* ── WORD GRID ─────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {isFiltered && total === 0 ? (
          /* Filtered empty state — Sheng for "We haven't found it" */
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <p
              className="font-display font-black uppercase leading-none text-muted-foreground/80 mb-4"
              style={{ fontSize: 'clamp(52px, 10vw, 100px)' }}
            >
              Hatujaipata.
            </p>
            <p className="text-muted-foreground/80 text-sm font-body mb-8 max-w-xs leading-relaxed">
              No results for your search. Try different keywords or remove a filter.
            </p>
            <a
              href="/browse"
              className="text-[11px] font-mono tracking-wider uppercase px-5 py-2.5 border border-white/10 text-muted-foreground/80 rounded-xl hover:border-[#c8f135]/30 hover:text-[#c8f135] transition-all"
            >
              Clear all filters
            </a>
          </div>
        ) : (
          <>
            {/* Alphabet letter shown when browsing unfiltered — decorative */}
            {!isFiltered && words.length > 0 && (
              <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-muted-foreground/80 mb-8">
                Showing page {page} of {totalPages} — {PAGE_SIZE} words per page
              </p>
            )}

            <WordsGrid key={`${q}|${pos}|${tag}|${page}`} words={words} immediate />

            <AdUnit slot="9112255298" className="my-8" />

            <BrowsePagination
              currentPage={page}
              totalPages={totalPages}
              baseParams={baseParams}
            />
          </>
        )}
      </main>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="mt-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="font-display font-black text-xl uppercase">
              SHENG<span className="text-[#c8f135]">.</span>
            </span>
            <p className="text-muted-foreground/80 text-xs mt-1 font-mono tracking-wide">
              Nairobi&apos;s unofficial official dictionary.
            </p>
          </div>
          <p className="text-muted-foreground/80 text-xs font-mono">
            © {new Date().getFullYear()} Sheng Dictionary. Built in Nairobi.
          </p>
        </div>
      </footer>
    </div>
  )
}

// ─── FilterBar loading skeleton ───────────────────────────────────────────────
function FilterBarSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-11 bg-white/5 rounded-xl" />
      <div className="flex gap-2">
        {['w-16', 'w-14', 'w-24', 'w-28', 'w-20'].map((w, i) => (
          <div key={i} className={`h-6 ${w} bg-white/5 rounded-full`} />
        ))}
      </div>
    </div>
  )
}

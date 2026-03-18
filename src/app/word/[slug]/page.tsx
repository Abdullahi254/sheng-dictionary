import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, MapPin, Eye, Calendar, ArrowRight } from 'lucide-react'

import { Navbar } from '@/components/shared/Navbar'
import { ViewCountTracker } from '@/components/words/ViewCountTracker'
import { ShareWordButton } from '@/components/words/ShareWordButton'
import { FlagButton } from '@/components/words/FlagButton'
import AdUnit from '@/components/shared/AdUnit'
import connectToDatabase from '@/lib/mongodb'
import Word from '@/models/Word'
import type { IWord, PartOfSpeech } from '@/types'

// ─── ISR: revalidate every hour ──────────────────────────────────────────────
export const revalidate = 3600

// ─── Types ────────────────────────────────────────────────────────────────────
type Props = {
  params: Promise<{ slug: string }>
}

interface RelatedWord {
  _id: string
  word: string
  slug: string
}

// ─── Data fetching ────────────────────────────────────────────────────────────
// React cache() deduplicates calls within one render — both generateMetadata
// and the page component resolve from this single DB query.
const getWordBySlug = cache(async (slug: string) => {
  try {
    await connectToDatabase()

    const doc = await Word.findOne({ slug, status: 'approved' }).lean()
    if (!doc) return null

    const word = JSON.parse(JSON.stringify(doc)) as IWord

    let relatedWords: RelatedWord[] = []
    if (word.relatedWords.length > 0) {
      const relatedDocs = await Word.find(
        { slug: { $in: word.relatedWords }, status: 'approved' },
        { word: 1, slug: 1 },
      ).lean()
      relatedWords = JSON.parse(JSON.stringify(relatedDocs)) as RelatedWord[]
    }

    return { word, relatedWords }
  } catch (err) {
    console.error('[WordPage] DB error:', err)
    return null
  }
})

// ─── generateStaticParams ─────────────────────────────────────────────────────
// Pre-build the 100 most-viewed words at deploy time.
// All other slugs are generated on-demand (dynamicParams = true default).
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    await connectToDatabase()
    const words = await Word.find({ status: 'approved' })
      .sort({ viewCount: -1 })
      .limit(100)
      .select('slug')
      .lean()
    return words.map((w) => ({ slug: String(w.slug) }))
  } catch {
    return []
  }
}

// ─── generateMetadata ─────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getWordBySlug(slug)

  if (!data) {
    return { title: 'Word Not Found | Sheng Dictionary' }
  }

  const { word } = data
  const firstDef = word.definitions[0]
  const capitalized = word.word.charAt(0).toUpperCase() + word.word.slice(1)

  return {
    title: `${capitalized} Meaning in Sheng | Sheng Dictionary`,
    description: `Learn what ${word.word} means in Sheng. ${firstDef?.meaning ?? ''}. See usage examples and related Sheng words.`,
    keywords: [word.word, 'sheng', 'nairobi slang', word.partOfSpeech, ...word.tags],
    alternates: {
      canonical: `/word/${word.slug}`,
    },
    openGraph: {
      title: `${capitalized} Meaning in Sheng`,
      description: `Learn what ${word.word} means in Sheng. ${firstDef?.meaning ?? ''}.`,
      type: 'article',
    },
  }
}

// ─── Design helpers ───────────────────────────────────────────────────────────
const posColors: Record<PartOfSpeech, string> = {
  noun:       'text-sky-400    border-sky-400/25    bg-sky-400/8',
  verb:       'text-orange-400 border-orange-400/25 bg-orange-400/8',
  adjective:  'text-violet-400 border-violet-400/25 bg-violet-400/8',
  expression: 'text-[#c8f135] border-[#c8f135]/25  bg-[#c8f135]/8',
  adverb:     'text-rose-400   border-rose-400/25   bg-rose-400/8',
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function WordPage({ params }: Props) {
  const { slug } = await params
  const data = await getWordBySlug(slug)

  if (!data) notFound()

  const { word, relatedWords } = data
  const posColor = posColors[word.partOfSpeech]

  // createdAt is an ISO string after JSON.parse(JSON.stringify()) serialization
  const createdAt = new Date(word.createdAt as unknown as string).toLocaleDateString(
    'en-KE',
    { month: 'long', year: 'numeric' },
  )

  // ─── JSON-LD: DefinedTerm structured data ─────────────────────────────────
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: word.word,
    description: word.definitions[0]?.meaning ?? '',
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'Sheng Dictionary',
    },
  }

  return (
    <>
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Client-side view increment */}
      <ViewCountTracker slug={word.slug} />

      <div className="min-h-screen bg-background">
        <Navbar />

        {/* ── WORD HEADER ───────────────────────────────────────────── */}
        <header className="pt-24 pb-0">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">

            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 mb-8 font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground/40"
            >
              <Link href="/" className="hover:text-muted-foreground/70 transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <Link href="/browse" className="hover:text-muted-foreground/70 transition-colors">Browse</Link>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <span className="text-muted-foreground/60">{word.word}</span>
            </nav>

            {/* Part of speech pill */}
            <div className="mb-4">
              <span className={`inline-block text-[10px] font-mono tracking-[0.3em] uppercase border rounded-full px-3 py-1 ${posColor}`}>
                {word.partOfSpeech}
              </span>
            </div>

            {/* h1 — the visual hero, must contain the word (SEO) */}
            <h1
              className="font-display font-black uppercase leading-[0.9] tracking-tight text-foreground mb-5"
              style={{ fontSize: 'clamp(60px, 13vw, 128px)' }}
            >
              {word.word}
            </h1>

            {/* Chartreuse accent rule */}
            <div className="h-px w-14 bg-[#c8f135] mb-6 opacity-50" />

            {/* Tag pills — accent-bordered, link to browse filtered by tag */}
            {word.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-6">
                {word.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/browse?tag=${encodeURIComponent(tag)}`}
                    className="inline-block text-[10px] font-mono tracking-wide border border-[#c8f135]/20 text-[#c8f135]/60 rounded-full px-2.5 py-0.5 hover:border-[#c8f135]/50 hover:text-[#c8f135] transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Meta row + share — pinned to bottom of header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-white/[0.06]">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground/40">
                {word.region && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" />
                    {word.region}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3 h-3" />
                  {word.viewCount.toLocaleString()} views
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  {createdAt}
                </span>
              </div>
              <ShareWordButton word={word} />
            </div>
          </div>
        </header>

        {/* ── CONTENT ───────────────────────────────────────────────── */}
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">

          {/* ── DEFINITIONS ─────────────────────────────────────────── */}
          <section aria-labelledby="definitions-heading">
            <h2
              id="definitions-heading"
              className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground/40 mb-4"
            >
              {word.definitions.length === 1 ? 'Definition' : `${word.definitions.length} Definitions`}
            </h2>

            <ol className="space-y-3">
              {word.definitions.map((def, idx) => (
                <li key={idx} className="group relative">
                  <div className="relative bg-[#111111] border border-white/[0.06] rounded-2xl overflow-hidden transition-colors duration-200 group-hover:border-white/[0.1]">

                    {/* Ghost index number */}
                    <span
                      aria-hidden
                      className="absolute top-3 right-4 font-display font-black leading-none text-white/[0.035] select-none pointer-events-none"
                      style={{ fontSize: 'clamp(52px, 7vw, 76px)' }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>

                    <div className="relative px-5 py-5 sm:px-6">
                      {/* Meaning */}
                      <p className="text-foreground/90 text-base sm:text-lg leading-relaxed font-body">
                        {def.meaning}
                      </p>

                      {/* Example sentence — italic, visually distinct */}
                      {def.example && (
                        <p className="mt-3 pl-3 border-l-2 border-[#c8f135]/20 text-muted-foreground/60 italic text-sm leading-relaxed font-body">
                          &ldquo;{def.example}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* AdUnit — outside the definition cards, between content sections */}
          <div className="min-h-[90px]">
            <AdUnit slot="9112255298" />
          </div>

          {/* ── ETYMOLOGY ───────────────────────────────────────────── */}
          {word.origin && (
            <section aria-labelledby="origin-heading">
              <h2
                id="origin-heading"
                className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground/40 mb-4"
              >
                Etymology
              </h2>
              <p className="pl-4 border-l-2 border-white/[0.08] text-muted-foreground/70 text-sm sm:text-base leading-relaxed font-body">
                {word.origin}
              </p>
            </section>
          )}

          {/* ── RELATED WORDS ───────────────────────────────────────── */}
          {relatedWords.length > 0 ? (
            <section aria-labelledby="related-heading">
              <h2
                id="related-heading"
                className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground/40 mb-4"
              >
                See Also
              </h2>
              <div className="flex flex-wrap gap-2">
                {relatedWords.map((rw) => (
                  <Link
                    key={rw._id}
                    href={`/word/${rw.slug}`}
                    className="
                      group/rw inline-flex items-center gap-1.5
                      px-4 py-2.5
                      bg-[#111111] border border-white/[0.06] rounded-xl
                      font-display font-black text-lg uppercase tracking-tight
                      text-foreground/80
                      hover:text-[#c8f135] hover:border-[#c8f135]/20 hover:bg-[#c8f135]/5
                      transition-all duration-200
                    "
                  >
                    {rw.word}
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover/rw:opacity-100 group-hover/rw:translate-x-0 transition-all duration-200" />
                  </Link>
                ))}
              </div>
            </section>
          ) : (
            /* Fallback CTA when no related words exist in DB */
            <section>
              <div className="flex items-center justify-between px-5 py-4 bg-[#111111] border border-white/[0.06] rounded-2xl">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/40">
                  Explore more Sheng words
                </p>
                <Link
                  href="/browse"
                  className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#c8f135]/70 hover:text-[#c8f135] hover:gap-2 transition-all duration-150"
                >
                  Browse <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </section>
          )}

          {/* ── PAGE FOOTER META ────────────────────────────────────── */}
          <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground/35">
              {word.submittedBy !== 'anonymous'
                ? `Submitted by ${word.submittedBy}`
                : 'Community submission'}
            </p>
            <div className="flex items-center gap-4">
              <FlagButton slug={word.slug} wordName={word.word} />
              <Link
                href="/browse"
                className="text-[10px] font-mono tracking-[0.25em] uppercase text-muted-foreground/40 hover:text-[#c8f135] transition-colors"
              >
                ← Back to Browse
              </Link>
            </div>
          </div>
        </main>

        {/* ── SITE FOOTER ───────────────────────────────────────────── */}
        <footer className="border-t border-white/[0.06]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <Link href="/" className="font-display font-black text-xl uppercase">
                SHENG<span className="text-[#c8f135]">.</span>
              </Link>
              <p className="text-muted-foreground/40 text-xs mt-1 font-mono tracking-wide">
                Nairobi&apos;s unofficial official dictionary.
              </p>
            </div>
            <p className="text-muted-foreground/35 text-xs font-mono">
              © {new Date().getFullYear()} Sheng Dictionary.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}

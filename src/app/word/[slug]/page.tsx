import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, MapPin, Eye, Calendar } from 'lucide-react'

import { Navbar } from '@/components/shared/Navbar'
import { ViewCountTracker } from '@/components/words/ViewCountTracker'
import { ShareWordButton } from '@/components/words/ShareWordButton'
import AdUnit from '@/components/shared/AdUnit'
import { Badge } from '@/components/ui/badge'
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

    // Batch-fetch related words in the same request
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
// Title format:       [Word] Meaning in Sheng | Sheng Dictionary
// Description format: Learn what [word] means in Sheng. [First definition].
//                     See usage examples and related Sheng words.
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
  noun: 'text-sky-400/80 border-sky-400/20 bg-sky-400/5',
  verb: 'text-orange-400/80 border-orange-400/20 bg-orange-400/5',
  adjective: 'text-violet-400/80 border-violet-400/20 bg-violet-400/5',
  expression: 'text-[#c8f135]/80 border-[#c8f135]/20 bg-[#c8f135]/5',
  adverb: 'text-rose-400/80 border-rose-400/20 bg-rose-400/5',
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
      {/* Structured data — search engines read this regardless of position */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Client-side view increment — fires on every real user visit,
          not just on ISR regeneration */}
      <ViewCountTracker slug={word.slug} />

      <div className="min-h-screen bg-background">
        <Navbar />

        {/* ── WORD HEADER ──────────────────────────────────────────────── */}
        <header className="pt-24 border-b border-white/6">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">

            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 mb-10 font-mono text-[11px] tracking-wider uppercase text-muted-foreground/80"
            >
              <Link href="/" className="hover:text-muted-foreground/80 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <Link href="/browse" className="hover:text-muted-foreground/80 transition-colors">
                Browse
              </Link>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <span className="text-muted-foreground/80">{word.word}</span>
            </nav>

            {/* Part of speech + tags */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span
                className={`inline-block text-[11px] font-mono tracking-[0.25em] uppercase border rounded-full px-3 py-1 ${posColor}`}
              >
                {word.partOfSpeech}
              </span>
              {word.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-[10px] font-mono tracking-wide bg-white/4 text-muted-foreground/80 border-0"
                >
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* h1 — must contain the word itself (SEO requirement) */}
            <h1
              className="font-display font-black uppercase leading-none tracking-tight text-foreground mb-6"
              style={{ fontSize: 'clamp(64px, 12vw, 144px)' }}
            >
              {word.word}
            </h1>

            {/* Share button — visible without scrolling on both mobile and desktop */}
            <div className="mb-8">
              <ShareWordButton word={word} />
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pb-10 font-mono text-[11px] tracking-wider uppercase text-muted-foreground/80">
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
                First seen {createdAt}
              </span>
            </div>
          </div>
        </header>

        {/* ── CONTENT ──────────────────────────────────────────────────── */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-20">

          {/* ── DEFINITIONS ──────────────────────────────────────────── */}
          <section aria-labelledby="definitions-heading">
            <h2
              id="definitions-heading"
              className="font-display font-black text-[11px] uppercase tracking-[0.35em] text-muted-foreground/80 mb-8"
            >
              {word.definitions.length === 1 ? 'Definition' : `${word.definitions.length} Definitions`}
            </h2>

            <ol className="space-y-5">
              {word.definitions.map((def, idx) => (
                <li key={idx} className="group relative">
                  <div className="relative bg-[#0f0f0f] border border-white/6 rounded-xl overflow-hidden transition-colors duration-200 group-hover:border-white/9">

                    {/* Ghost number — decorative, not in the reading flow */}
                    <span
                      aria-hidden
                      className="absolute top-2 right-5 font-display font-black leading-none text-white/[0.035] select-none pointer-events-none"
                      style={{ fontSize: 'clamp(72px, 9vw, 108px)' }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>

                    <div className="relative p-7 md:p-10">
                      {/* Meaning */}
                      <p className="text-foreground/85 text-lg md:text-xl leading-relaxed font-body mb-0">
                        {def.meaning}
                      </p>

                      {/* Ad between definition and example — first card only */}
                      {idx === 0 && (
                        <AdUnit slot="9112255298" className="my-5" />
                      )}

                      {/* Example sentence */}
                      {def.example && (
                        <blockquote className="mt-5 pl-4 border-l-2 border-[#c8f135]/30 text-muted-foreground italic text-base leading-relaxed">
                          &ldquo;{def.example}&rdquo;
                        </blockquote>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* ── ETYMOLOGY ────────────────────────────────────────────── */}
          {word.origin && (
            <section aria-labelledby="origin-heading">
              <h2
                id="origin-heading"
                className="font-display font-black text-[11px] uppercase tracking-[0.35em] text-muted-foreground/80 mb-6"
              >
                Etymology
              </h2>
              <p className="pl-5 border-l border-white/10 text-muted-foreground text-base leading-relaxed max-w-2xl">
                {word.origin}
              </p>
            </section>
          )}

          {/* ── RELATED WORDS ────────────────────────────────────────── */}
          {relatedWords.length > 0 && (
            <section aria-labelledby="related-heading">
              <h2
                id="related-heading"
                className="font-display font-black text-[11px] uppercase tracking-[0.35em] text-muted-foreground/80 mb-6"
              >
                See Also
              </h2>
              <div className="flex flex-wrap gap-3">
                {relatedWords.map((rw) => (
                  <Link
                    key={rw._id}
                    href={`/word/${rw.slug}`}
                    className="
                      group/rw inline-flex items-center gap-1.5
                      px-5 py-3
                      bg-[#111111] border border-white/[0.07] rounded-xl
                      font-display font-black text-xl uppercase tracking-tight
                      text-foreground/85
                      hover:text-[#c8f135] hover:border-[#c8f135]/20 hover:bg-[#c8f135]/4
                      transition-all duration-200
                    "
                  >
                    {rw.word}
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover/rw:opacity-100 group-hover/rw:translate-x-0 transition-all duration-200" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── PAGE FOOTER META ─────────────────────────────────────── */}
          <div className="pt-10 border-t border-white/6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="font-mono text-[11px] tracking-wider uppercase text-muted-foreground/80">
              {word.submittedBy !== 'anonymous'
                ? `Submitted by ${word.submittedBy}`
                : 'Community submission'}
            </p>
            <Link
              href="/browse"
              className="text-[11px] font-mono tracking-wider uppercase text-muted-foreground/80 hover:text-[#c8f135] transition-colors"
            >
              ← Back to Browse
            </Link>
          </div>
        </main>

        {/* ── SITE FOOTER ──────────────────────────────────────────────── */}
        <footer className="mt-8 border-t border-white/5">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <Link href="/" className="font-display font-black text-xl uppercase">
                SHENG<span className="text-[#c8f135]">.</span>
              </Link>
              <p className="text-muted-foreground/80 text-xs mt-1 font-mono tracking-wide">
                Nairobi&apos;s unofficial official dictionary.
              </p>
            </div>
            <p className="text-muted-foreground/80 text-xs font-mono">
              © {new Date().getFullYear()} Sheng Dictionary.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}

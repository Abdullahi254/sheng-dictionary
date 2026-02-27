import type { Metadata } from 'next'
import Image from 'next/image'
import { Navbar } from '@/components/shared/Navbar'
import { SearchBar } from '@/components/shared/SearchBar'
import { WordOfTheWeekCard } from '@/components/words/WordOfTheWeekCard'
import { WordsGrid } from '@/components/words/WordsGrid'
import { SubscribeForm } from '@/components/shared/SubscribeForm'
import { Footer } from '@/components/shared/Footer'
import connectToDatabase from '@/lib/mongodb'
import Word from '@/models/Word'
import WordOfTheWeek from '@/models/WordOfTheWeek'
import type { IWordDocument } from '@/models/Word'
import type { IWord } from '@/types'
import { getCurrentWeekStart } from '@/lib/utils'

// ISR — revalidate every 5 minutes so new approved words appear promptly
export const revalidate = 300

export const metadata: Metadata = {
  title: "Sheng Dictionary — Nairobi's Street Language, Translated",
  description:
    'The definitive Sheng dictionary. Look up Nairobi slang, see real usage examples, and discover the words Gen Z Kenyans actually use.',
}

async function getHomepageData(): Promise<{
  wordOfTheWeek: IWord | null
  recentWords: IWord[]
  weekStart: string
}> {
  const weekStart = getCurrentWeekStart()

  try {
    await connectToDatabase()

    const [wotwDoc, wordDocs] = await Promise.all([
      WordOfTheWeek.findOne({ weekStart })
        .populate<{ word: IWordDocument }>('word')
        .lean(),
      Word.find({ status: 'approved' }).sort({ createdAt: -1 }).limit(12).lean(),
    ])

    const wordOfTheWeek: IWord | null =
      wotwDoc?.word ? (JSON.parse(JSON.stringify(wotwDoc.word)) as IWord) : null

    const recentWords: IWord[] = JSON.parse(JSON.stringify(wordDocs)) as IWord[]

    return { wordOfTheWeek, recentWords, weekStart }
  } catch (err) {
    console.error('[HomePage] DB fetch error:', err)
    return { wordOfTheWeek: null, recentWords: [], weekStart }
  }
}

export default async function HomePage() {
  const { wordOfTheWeek, recentWords, weekStart } = await getHomepageData()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-16 overflow-hidden">

        {/* Matatu background photo — darkened, golden warmth bleeds through */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/matatu.jpg"
            alt=""
            fill
            className="object-cover object-center"
            style={{ filter: 'brightness(0.6) saturate(1.6)' }}
            priority
          />
          {/* Bottom: photo fades into page background */}
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/35 to-background" />
          {/* Left vignette: keeps headline text crisp */}
          <div className="absolute inset-0 bg-linear-to-r from-background/50 via-background/10 to-transparent" />
        </div>

        {/* Ghost "SHENG" outline — layered above photo */}
        <div
          aria-hidden
          className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden"
        >
          <span
            className="font-display font-black leading-none uppercase text-transparent"
            style={{
              fontSize: 'clamp(180px, 30vw, 520px)',
              WebkitTextStroke: '1px rgba(200,241,53,0.07)',
            }}
          >
            SHENG
          </span>
        </div>

        {/* Chartreuse ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-225 h-150 rounded-full"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(200,241,53,0.04) 0%, transparent 65%)',
          }}
        />

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto w-full">
          {/* Overline */}
          <p className="mb-6 font-mono text-[10px] tracking-[0.5em] uppercase text-[#c8f135]">
            Nairobi ✦ Kenya ✦ East Africa
          </p>

          {/* Main headline */}
          <h1 className="font-display font-black uppercase leading-[0.92] tracking-tight mb-8">
            <span
              className="block text-foreground"
              style={{ fontSize: 'clamp(56px, 10vw, 120px)' }}
            >
              The Streets
            </span>
            <span
              className="block text-[#c8f135]"
              style={{ fontSize: 'clamp(56px, 10vw, 120px)' }}
            >
              Translated.
            </span>
          </h1>

          {/* Subheading — foreground/75 instead of muted for readability over image */}
          <p className="mb-10 text-foreground/75 text-base md:text-lg max-w-md mx-auto leading-relaxed font-body">
            The only dictionary that actually speaks Sheng. Look up slang, submit new words, and represent Nairobi.
          </p>

          <SearchBar />

          <p className="mt-5 font-mono text-[11px] tracking-widest text-foreground/45 uppercase">
            {recentWords.length > 0
              ? `${recentWords.length}+ words approved`
              : 'Be the first to add a word →'}
          </p>
        </div>

        {/* Scroll indicator */}
        <div
          aria-hidden
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-px h-20 bg-linear-to-b from-transparent via-[#c8f135]/35 to-transparent" />
        </div>
      </section>

      {/* ── WORD OF THE WEEK ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-28">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-2 h-2 rounded-full bg-[#c8f135] animate-pulse" />
          <h2 className="font-display font-black text-base uppercase tracking-[0.25em] text-muted-foreground">
            Word of the Week
          </h2>
        </div>
        <WordOfTheWeekCard word={wordOfTheWeek} weekStart={weekStart} />
      </section>

      {/* ── RECENT WORDS ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-28">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <h2
              className="font-display font-black uppercase leading-none tracking-tight"
              style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}
            >
              Fresh from the
              <span className="text-[#c8f135]"> Streets</span>
            </h2>
            <p className="mt-3 text-muted-foreground text-sm font-mono tracking-wide">
              Latest approved words — certified by the people.
            </p>
          </div>
          {recentWords.length > 0 && (
            <span className="hidden md:inline-block text-[11px] font-mono tracking-widest uppercase text-muted-foreground border border-white/[0.07] px-4 py-2 rounded-lg shrink-0">
              {recentWords.length} words
            </span>
          )}
        </div>

        <WordsGrid words={recentWords} />
      </section>

      {/* ── SUBMIT CTA ──────────────────────────────────────────────────── */}
      {recentWords.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="relative rounded-2xl overflow-hidden border border-[#c8f135]/15 bg-[#0f0f0f] px-8 py-14 text-center">
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(-45deg, rgba(200,241,53,0.025) 0px, rgba(200,241,53,0.025) 1px, transparent 1px, transparent 28px)',
              }}
            />
            <div className="relative z-10">
              <p className="font-mono text-[11px] tracking-[0.4em] uppercase text-[#c8f135] mb-4">
                Contribute
              </p>
              <h3 className="font-display font-black text-4xl md:text-5xl uppercase leading-none mb-4">
                Know a word we don&apos;t?
              </h3>
              <p className="text-muted-foreground text-base mb-8 max-w-sm mx-auto">
                Submit it. Keep the dictionary growing. The streets evolve — so should we.
              </p>
              <a
                href="/submit"
                className="inline-flex items-center gap-2 bg-[#c8f135] text-black font-display font-bold text-sm uppercase tracking-wider px-8 py-3.5 rounded-xl hover:bg-[#d4f545] active:scale-95 transition-all"
              >
                Submit a Word
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ── SUBSCRIBE ───────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="relative rounded-2xl overflow-hidden border border-white/8 bg-[#0c0c0c] px-8 py-14 text-center">
          {/* Subtle noise texture */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
            }}
          />
          <div className="relative z-10">
            <p className="font-mono text-[10px] tracking-[0.5em] uppercase text-[#c8f135] mb-4">
              Weekly word
            </p>
            <h3
              className="font-display font-black uppercase leading-none tracking-tight mb-4"
              style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}
            >
              Get the word<br />
              <span className="text-[#c8f135]">of the week.</span>
            </h3>
            <p className="text-muted-foreground/80 text-sm font-body mb-8 max-w-xs mx-auto leading-relaxed">
              One Sheng word, every week. Free forever.
            </p>
            <SubscribeForm />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

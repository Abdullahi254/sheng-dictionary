'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { IWord } from '@/types'

interface WordOfTheWeekCardProps {
  word: IWord | null
  weekStart: string // YYYY-MM-DD (Monday of the current week)
}

function formatWeekStart(dateStr: string): string {
  // Parse YYYY-MM-DD manually to avoid timezone issues
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function WordOfTheWeekCard({ word, weekStart }: WordOfTheWeekCardProps) {
  const formattedDate = formatWeekStart(weekStart)

  /* ── Empty state ───────────────────────────────────────────── */
  if (!word) {
    return (
      <div className="relative w-full bg-[#0f0f0f] border border-white/[0.06] rounded-2xl p-10 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#c8f135]" />
        <div className="flex items-center gap-3 mb-8">
          <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-[#c8f135] font-bold">
            Word of the Week
          </span>
          <span className="text-white/20">///</span>
          <span className="text-[11px] font-mono tracking-wider text-muted-foreground uppercase">
            Week of {formattedDate}
          </span>
        </div>
        <p className="font-display font-black text-4xl uppercase text-muted-foreground/80">
          No word yet.
        </p>
        <p className="text-muted-foreground mt-3 text-sm">
          The streets are quiet this week. Check back Monday.
        </p>
      </div>
    )
  }

  const firstDef = word.definitions[0]

  /* ── Full card ─────────────────────────────────────────────── */
  return (
    <motion.div
      className="relative w-full bg-[#0f0f0f] border border-white/[0.06] rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Left accent stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#c8f135]" />

      {/* Decorative diagonal stripe pattern — right third */}
      <div
        aria-hidden
        className="absolute right-0 top-0 bottom-0 w-2/5 pointer-events-none opacity-100"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(200,241,53,0.025) 0px, rgba(200,241,53,0.025) 1px, transparent 1px, transparent 22px)',
        }}
      />

      {/* Ambient glow behind the word */}
      <div
        aria-hidden
        className="absolute top-0 left-12 w-[500px] h-[300px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at top left, rgba(200,241,53,0.055) 0%, transparent 65%)',
        }}
      />

      <div className="relative px-8 py-10 md:px-14 md:py-14">
        {/* Header row */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono tracking-[0.3em] uppercase text-[#c8f135] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c8f135] animate-pulse" />
            Word of the Week
          </span>
          <span className="text-white/15 text-xs">///</span>
          <span className="text-[11px] font-mono tracking-wider text-muted-foreground uppercase">
            Week of {formattedDate}
          </span>
        </div>

        {/* Word + part of speech */}
        <div className="flex flex-wrap items-end gap-4 md:gap-8 mb-6">
          <h2
            className="font-display font-black leading-none uppercase text-[#c8f135] tracking-tight"
            style={{ fontSize: 'clamp(64px, 10vw, 128px)' }}
          >
            {word.word}
          </h2>
          <span className="mb-2 md:mb-4 text-sm font-mono text-muted-foreground/80 uppercase tracking-[0.2em]">
            {word.partOfSpeech}
          </span>
        </div>

        {/* Definition */}
        {firstDef && (
          <p className="text-foreground/75 text-lg md:text-xl leading-relaxed max-w-2xl mb-4">
            {firstDef.meaning}
          </p>
        )}

        {/* Example sentence */}
        {firstDef?.example && (
          <p className="text-muted-foreground/80 italic text-base leading-relaxed max-w-2xl mb-10 border-l-2 border-white/10 pl-4">
            &ldquo;{firstDef.example}&rdquo;
          </p>
        )}

        {/* CTA */}
        <Link
          href={`/word/${word.slug}`}
          className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.2em] uppercase text-[#c8f135] hover:gap-4 transition-all duration-200 group"
        >
          Explore full entry
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  )
}

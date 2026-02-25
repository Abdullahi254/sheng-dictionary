'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { IWord, PartOfSpeech } from '@/types'

interface WordCardProps {
  word: IWord
}

// Part of speech label colors — subtle, not garish
const posColors: Record<PartOfSpeech, string> = {
  noun: 'text-sky-400/70 border-sky-400/15',
  verb: 'text-orange-400/70 border-orange-400/15',
  adjective: 'text-violet-400/70 border-violet-400/15',
  expression: 'text-[#c8f135]/70 border-[#c8f135]/15',
  adverb: 'text-rose-400/70 border-rose-400/15',
}

// Stagger animation — parent WordsGrid drives the timing
export const wordCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
}

export function WordCard({ word }: WordCardProps) {
  const firstDef = word.definitions[0]
  const posColor = posColors[word.partOfSpeech] ?? 'text-muted-foreground border-white/10'

  return (
    // Outer: stagger variant wrapper
    <motion.div variants={wordCardVariants} className="h-full">
      {/* Inner: hover animation wrapper */}
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="group relative h-full"
      >
        {/* Hover accent border — slides in from bottom */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl bg-[#c8f135] scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-bottom z-10" />

        <Link
          href={`/word/${word.slug}`}
          className="flex flex-col h-full p-6 bg-[#111111] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/10 hover:bg-[#141414] transition-colors duration-200"
        >
          {/* Part of speech */}
          <div className="mb-4">
            <span
              className={`inline-block text-[10px] font-mono tracking-[0.25em] uppercase border rounded-full px-2.5 py-0.5 ${posColor}`}
            >
              {word.partOfSpeech}
            </span>
          </div>

          {/* Word */}
          <h3 className="font-display font-black text-3xl md:text-4xl uppercase tracking-tight text-foreground group-hover:text-[#c8f135] transition-colors duration-200 mb-3 leading-none">
            {word.word}
          </h3>

          {/* Definition — clamped to 2 lines */}
          {firstDef && (
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 flex-1">
              {firstDef.meaning}
            </p>
          )}

          {/* Footer: region + tags */}
          <div className="mt-5 flex items-center justify-between gap-2">
            {word.region && (
              <span className="text-[10px] font-mono text-muted-foreground/80 uppercase tracking-wider truncate">
                {word.region}
              </span>
            )}
            <div className="flex items-center gap-1 ml-auto flex-shrink-0">
              {word.tags.slice(0, 1).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-[10px] font-mono tracking-wide bg-white/5 text-muted-foreground/80 border-0"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  )
}

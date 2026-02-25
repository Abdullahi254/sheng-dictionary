'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { WordCard } from './WordCard'
import type { IWord } from '@/types'

interface WordsGridProps {
  words: IWord[]
  // When true, animate immediately instead of waiting for scroll (use on browse page)
  immediate?: boolean
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
}

export function WordsGrid({ words, immediate = false }: WordsGridProps) {
  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-display font-black text-5xl uppercase text-muted-foreground/80 mb-4">
          No words yet.
        </p>
        <p className="text-muted-foreground text-sm mb-6">
          The dictionary is empty. Be the first to add a Sheng word.
        </p>
        <Link
          href="/submit"
          className="text-xs font-mono tracking-wider uppercase px-5 py-2.5 bg-[#c8f135] text-black rounded-lg font-bold hover:bg-[#d4f545] transition-colors"
        >
          Submit a Word
        </Link>
      </div>
    )
  }

  const animationProps = immediate
    ? { animate: 'visible' }
    : { whileInView: 'visible', viewport: { once: true, margin: '-80px' } }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      {...animationProps}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {words.map((word) => (
        <WordCard key={word._id} word={word} />
      ))}
    </motion.div>
  )
}

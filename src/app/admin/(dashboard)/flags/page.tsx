import { Calendar, User, AlertTriangle } from 'lucide-react'

import connectToDatabase from '@/lib/mongodb'
import Flag from '@/models/Flag'
import Word from '@/models/Word'
import { FlagActions } from '@/components/admin/FlagActions'
import type { IFlag, IWord, FlagReason } from '@/types'

// Session already verified by the admin layout.

const REASON_LABELS: Record<FlagReason, string> = {
  not_sheng: 'Not Sheng',
  mistranslation: 'Wrong translation',
  offensive: 'Offensive',
  outdated: 'Outdated',
  other: 'Other',
}

const REASON_PILL_COLORS: Record<FlagReason, string> = {
  not_sheng: 'text-red-400/80 border-red-400/20',
  mistranslation: 'text-orange-400/80 border-orange-400/20',
  offensive: 'text-red-400/80 border-red-400/20',
  outdated: 'text-muted-foreground/80 border-white/10',
  other: 'text-muted-foreground/80 border-white/10',
}

const posColors: Record<string, string> = {
  noun: 'text-sky-400/80 border-sky-400/20',
  verb: 'text-orange-400/80 border-orange-400/20',
  adjective: 'text-violet-400/80 border-violet-400/20',
  expression: 'text-[#c8f135]/80 border-[#c8f135]/20',
  adverb: 'text-rose-400/80 border-rose-400/20',
}

async function getPendingFlags(): Promise<{ flag: IFlag; word: IWord | null }[]> {
  await connectToDatabase()
  const flagDocs = await Flag.find({ status: 'pending' }).sort({ createdAt: -1 }).lean()
  const flags = JSON.parse(JSON.stringify(flagDocs)) as IFlag[]

  const results = await Promise.all(
    flags.map(async (flag) => {
      const wordDoc = await Word.findById(flag.wordId).lean()
      return {
        flag,
        word: wordDoc ? (JSON.parse(JSON.stringify(wordDoc)) as IWord) : null,
      }
    })
  )

  return results
}

export default async function FlagsPage() {
  const items = await getPendingFlags()

  return (
    <div className="max-w-4xl space-y-6 sm:space-y-8">

      {/* Page header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-muted-foreground/80 mb-2">
            Admin
          </p>
          <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight">
            Flags
          </h1>
        </div>
        {items.length > 0 && (
          <span className="font-mono text-[11px] tracking-wider uppercase text-muted-foreground/80 border border-white/8 px-3 py-1.5 rounded-lg shrink-0">
            {items.length} pending
          </span>
        )}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-white/6 rounded-xl bg-[#111111]">
          <p className="font-display font-black text-4xl uppercase text-muted-foreground/80 mb-3">
            All clear
          </p>
          <p className="text-muted-foreground/80 text-sm font-body">
            No pending flags. Community looks clean.
          </p>
        </div>
      )}

      {/* Flag list */}
      {items.length > 0 && (
        <ol className="space-y-4">
          {items.map(({ flag, word }) => {
            const reasonPillColor = REASON_PILL_COLORS[flag.reason]
            const reasonLabel = REASON_LABELS[flag.reason]
            const posColor = word ? (posColors[word.partOfSpeech] ?? 'text-muted-foreground/80 border-white/10') : ''
            const createdAt = new Date(flag.createdAt as unknown as string).toLocaleDateString(
              'en-KE',
              { day: 'numeric', month: 'short', year: 'numeric' }
            )

            return (
              <li
                key={flag._id}
                className="bg-[#111111] border border-white/6 rounded-xl overflow-hidden"
              >
                <div className="p-4 sm:p-6 space-y-4">

                  {/* Word name + reason pill */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight leading-none">
                      {flag.wordName}
                    </h2>
                    <span className={`text-[10px] font-mono tracking-[0.2em] uppercase border rounded-full px-2.5 py-0.5 ${reasonPillColor}`}>
                      {reasonLabel}
                    </span>
                    {word && (
                      <span className={`text-[10px] font-mono tracking-[0.2em] uppercase border rounded-full px-2.5 py-0.5 ${posColor}`}>
                        {word.partOfSpeech}
                      </span>
                    )}
                  </div>

                  {/* Suggestion */}
                  {flag.suggestion && (
                    <div className="pl-4 border-l-2 border-white/8">
                      <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground/80 mb-1">Suggestion</p>
                      <p className="text-foreground/80 text-sm font-body leading-relaxed">
                        {flag.suggestion}
                      </p>
                    </div>
                  )}

                  {/* Reporter meta */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-muted-foreground/80">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3 h-3" />
                      {flag.reportedBy}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {createdAt}
                    </span>
                  </div>

                  {/* Current word data or "word deleted" warning */}
                  {word ? (
                    <div className="pt-3 border-t border-white/6 space-y-3">
                      <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-muted-foreground/80">
                        Current word data
                      </p>

                      {/* Definition */}
                      <div className="space-y-1">
                        <p className="text-foreground/80 text-sm leading-relaxed font-body">
                          {word.definitions[0]?.meaning}
                        </p>
                        {word.definitions[0]?.example && (
                          <p className="pl-4 border-l border-white/10 text-muted-foreground/80 text-xs italic leading-relaxed font-body">
                            &ldquo;{word.definitions[0].example}&rdquo;
                          </p>
                        )}
                      </div>

                      {/* Tags */}
                      {word.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {word.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-mono text-muted-foreground/80 border border-white/8 rounded-full px-2 py-0.5"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* FlagActions */}
                      <div className="pt-2 border-t border-white/6">
                        <FlagActions
                          flagId={flag._id}
                          wordId={word._id}
                          initialData={{
                            word: word.word,
                            slug: word.slug,
                            partOfSpeech: word.partOfSpeech,
                            meaning: word.definitions[0]?.meaning ?? '',
                            example: word.definitions[0]?.example ?? '',
                            origin: word.origin ?? '',
                            tags: word.tags,
                            relatedWords: word.relatedWords,
                            region: word.region,
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-white/6">
                      <div className="flex items-center gap-2 px-4 py-3 bg-red-500/5 border border-red-500/15 rounded-lg">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400/80 shrink-0" />
                        <p className="text-red-400/80 text-xs font-mono">
                          Word no longer exists in the database.
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

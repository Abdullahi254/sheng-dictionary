import { Calendar, User } from 'lucide-react'

import connectToDatabase from '@/lib/mongodb'
import Submission from '@/models/Submission'
import { SubmissionActions } from '@/components/admin/SubmissionActions'
import type { ISubmission } from '@/types'

// Session already verified by the admin layout.

async function getPendingSubmissions(): Promise<ISubmission[]> {
  await connectToDatabase()
  const docs = await Submission.find({ status: 'pending' })
    .sort({ createdAt: -1 })
    .lean()
  return JSON.parse(JSON.stringify(docs)) as ISubmission[]
}

const posColors: Record<string, string> = {
  noun: 'text-sky-400/80 border-sky-400/20',
  verb: 'text-orange-400/80 border-orange-400/20',
  adjective: 'text-violet-400/80 border-violet-400/20',
  expression: 'text-[#c8f135]/80 border-[#c8f135]/20',
  adverb: 'text-rose-400/80 border-rose-400/20',
}

export default async function SubmissionsPage() {
  const submissions = await getPendingSubmissions()

  return (
    <div className="max-w-4xl space-y-8">

      {/* Page header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-muted-foreground/80 mb-2">
            Admin
          </p>
          <h1 className="font-display font-black text-4xl uppercase tracking-tight">
            Submissions
          </h1>
        </div>
        {submissions.length > 0 && (
          <span className="font-mono text-[11px] tracking-wider uppercase text-muted-foreground/80 border border-white/8 px-3 py-1.5 rounded-lg shrink-0">
            {submissions.length} pending
          </span>
        )}
      </div>

      {/* Empty state */}
      {submissions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-white/6 rounded-xl bg-[#111111]">
          <p className="font-display font-black text-4xl uppercase text-muted-foreground/80 mb-3">
            All clear
          </p>
          <p className="text-muted-foreground/80 text-sm font-body">
            No pending submissions. Check back later.
          </p>
        </div>
      )}

      {/* Submission list */}
      {submissions.length > 0 && (
        <ol className="space-y-4">
          {submissions.map((sub) => {
            const posColor = posColors[sub.partOfSpeech] ?? 'text-muted-foreground/80 border-white/10'
            const createdAt = new Date(sub.createdAt as unknown as string).toLocaleDateString(
              'en-KE',
              { day: 'numeric', month: 'short', year: 'numeric' },
            )

            return (
              <li
                key={sub._id}
                className="bg-[#111111] border border-white/6 rounded-xl overflow-hidden"
              >
                <div className="p-6 space-y-4">

                  {/* Word + PoS */}
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-display font-black text-3xl uppercase tracking-tight leading-none">
                      {sub.word}
                    </h2>
                    <span
                      className={`text-[10px] font-mono tracking-[0.2em] uppercase border rounded-full px-2.5 py-0.5 ${posColor}`}
                    >
                      {sub.partOfSpeech}
                    </span>
                    {sub.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono text-muted-foreground/80 border border-white/8 rounded-full px-2 py-0.5"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Definitions */}
                  <div className="space-y-3">
                    {sub.definitions.map((def, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-foreground/80 text-sm leading-relaxed font-body">
                          {sub.definitions.length > 1 && (
                            <span className="text-muted-foreground/80 font-mono text-xs mr-2">
                              {i + 1}.
                            </span>
                          )}
                          {def.meaning}
                        </p>
                        {def.example && (
                          <p className="pl-4 border-l border-white/10 text-muted-foreground/80 text-xs italic leading-relaxed font-body">
                            &ldquo;{def.example}&rdquo;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Origin */}
                  {sub.origin && (
                    <p className="text-muted-foreground/80 text-xs font-mono">
                      <span className="text-muted-foreground/80 uppercase tracking-wider mr-2">Origin:</span>
                      {sub.origin}
                    </p>
                  )}

                  {/* Meta row + actions */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/6">
                    <div className="flex items-center gap-4 text-[11px] font-mono text-muted-foreground/80">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3 h-3" />
                        {sub.submittedBy}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {createdAt}
                      </span>
                      {sub.region && sub.region !== 'Nationwide' && (
                        <span>{sub.region}</span>
                      )}
                    </div>

                    <SubmissionActions id={sub._id} />
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

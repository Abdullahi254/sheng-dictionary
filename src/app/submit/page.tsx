'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Loader2, ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/shared/Navbar'
import { TagsInput } from '@/components/words/TagsInput'
import { RelatedWordsSelect } from '@/components/words/RelatedWordsSelect'
import type { PartOfSpeech } from '@/types'

// ─── Options ─────────────────────────────────────────────────────────────────

const POS_OPTIONS: { value: PartOfSpeech; label: string }[] = [
  { value: 'noun', label: 'Noun' },
  { value: 'verb', label: 'Verb' },
  { value: 'adjective', label: 'Adjective' },
  { value: 'expression', label: 'Expression' },
  { value: 'adverb', label: 'Adverb' },
]

const REGION_OPTIONS = [
  'Nationwide',
  'Nairobi CBD',
  'Eastlands',
  'Westlands',
  'Southlands',
  'Kibera',
  'Mathare',
  'Karen / Langata',
  'Ngong Road',
  'Mombasa',
  'Kisumu',
  'Nakuru',
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  word: string
  partOfSpeech: PartOfSpeech | ''
  definition: string
  example: string
  etymology: string
  region: string
  submittedBy: string
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

const EMPTY_FORM: FormState = {
  word: '',
  partOfSpeech: '',
  definition: '',
  example: '',
  etymology: '',
  region: 'Nationwide',
  submittedBy: '',
}

// ─── Field components ─────────────────────────────────────────────────────────

const inputClass = `
  w-full px-4 bg-white/5 border border-white/8 rounded-xl text-sm text-foreground
  placeholder:text-muted-foreground/80 outline-none font-body
  transition-all duration-200
  focus:border-[#c8f135]/30 focus:bg-white/6
`

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SubmitPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [tags, setTags] = useState<string[]>([])
  const [relatedWords, setRelatedWords] = useState<string[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: form.word,
          definition: form.definition,
          example: form.example,
          etymology: form.etymology,
          partOfSpeech: form.partOfSpeech,
          region: form.region,
          submittedBy: form.submittedBy,
          tags,
          relatedWords,
        }),
      })

      const data = (await res.json()) as { success: boolean; error?: string }

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? 'Submission failed. Please try again.')
      }

      setStatus('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── SUCCESS STATE ──────────────────────────────────────────── */}
      {status === 'success' ? (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
          {/* Decorative stripe */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none opacity-[0.015]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(-45deg, #c8f135 0px, #c8f135 1px, transparent 1px, transparent 28px)',
            }}
          />
          <div className="relative z-10">
            <p className="font-mono text-[10px] tracking-[0.5em] uppercase text-[#c8f135] mb-6">
              Submission received
            </p>
            <h1
              className="font-display font-black uppercase leading-none tracking-tight mb-6"
              style={{ fontSize: 'clamp(72px, 15vw, 160px)' }}
            >
              Sawa<span className="text-[#c8f135]">.</span>
            </h1>
            <p className="text-muted-foreground/80 text-base font-body max-w-sm mx-auto leading-relaxed mb-10">
              <strong className="text-foreground/80">&ldquo;{form.word}&rdquo;</strong> is in the
              queue. The admin will review it and if approved, it&apos;ll appear on the site.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => { setForm(EMPTY_FORM); setTags([]); setRelatedWords([]); setStatus('idle') }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#c8f135] text-black font-display font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#d4f545] active:scale-95 transition-all"
              >
                Submit another word
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 text-muted-foreground/80 font-mono text-xs uppercase tracking-wider rounded-xl hover:border-white/20 hover:text-foreground/80 transition-all"
              >
                Browse the dictionary
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* ── FORM STATE ──────────────────────────────────────────── */
        <>
          {/* Header */}
          <header className="pt-28 pb-12 border-b border-white/5">
            <div className="max-w-2xl mx-auto px-4 sm:px-6">
              <p className="font-mono text-[10px] tracking-[0.5em] uppercase text-[#c8f135] mb-4">
                Community
              </p>
              <h1
                className="font-display font-black uppercase leading-none tracking-tight mb-4"
                style={{ fontSize: 'clamp(48px, 9vw, 100px)' }}
              >
                Submit a<span className="text-[#c8f135]"> Word</span>
              </h1>
              <p className="text-muted-foreground/80 text-base font-body leading-relaxed max-w-md">
                Know a word the dictionary doesn&apos;t have? Add it. Every submission is reviewed
                before it goes live — keep it real, keep it Sheng.
              </p>
            </div>
          </header>

          {/* Form */}
          <main className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
            <form onSubmit={handleSubmit} className="space-y-7" noValidate>

              {/* Error banner */}
              {status === 'error' && errorMsg && (
                <div className="px-4 py-3 bg-red-500/8 border border-red-500/20 rounded-xl text-red-400/80 text-sm font-mono">
                  {errorMsg}
                </div>
              )}

              {/* ── Word ── */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground/80">
                  Word <span className="text-[#c8f135]">*</span>
                </label>
                <input
                  type="text"
                  value={form.word}
                  onChange={set('word')}
                  placeholder="e.g. msee, poa, mchoro…"
                  required
                  autoComplete="off"
                  spellCheck={false}
                  className={`${inputClass} h-14 text-lg font-display font-bold uppercase tracking-wide`}
                />
              </div>

              {/* ── Part of speech ── */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground/80">
                  Part of speech <span className="text-[#c8f135]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.partOfSpeech}
                    onChange={set('partOfSpeech')}
                    required
                    className={`${inputClass} h-12 appearance-none cursor-pointer pr-10`}
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  >
                    <option value="" disabled style={{ background: '#111' }}>
                      Select…
                    </option>
                    {POS_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value} style={{ background: '#111' }}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
                </div>
              </div>

              {/* ── Definition ── */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground/80">
                  Definition <span className="text-[#c8f135]">*</span>
                </label>
                <textarea
                  value={form.definition}
                  onChange={set('definition')}
                  placeholder="What does this word mean? Be clear and specific."
                  required
                  rows={3}
                  className={`${inputClass} py-3 resize-none leading-relaxed`}
                />
              </div>

              {/* ── Example ── */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground/80">
                  Example sentence
                  <span className="ml-2 text-muted-foreground/80 normal-case tracking-normal font-body text-xs">
                    (optional but helpful)
                  </span>
                </label>
                <textarea
                  value={form.example}
                  onChange={set('example')}
                  placeholder="Show how the word is used in a sentence."
                  rows={2}
                  className={`${inputClass} py-3 resize-none leading-relaxed`}
                />
              </div>

              {/* ── Etymology ── */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground/80">
                  Etymology
                  <span className="ml-2 text-muted-foreground/80 normal-case tracking-normal font-body text-xs">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  value={form.etymology}
                  onChange={set('etymology')}
                  placeholder="e.g. Derived from Kiswahili 'msee' meaning elder…"
                  autoComplete="off"
                  className={`${inputClass} h-12`}
                />
              </div>

              {/* ── Tags ── */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground/80">
                  Tags
                  <span className="ml-2 text-muted-foreground/80 normal-case tracking-normal font-body text-xs">
                    (optional)
                  </span>
                </label>
                <TagsInput value={tags} onChange={setTags} />
              </div>

              {/* ── Related words ── */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground/80">
                  Related words
                  <span className="ml-2 text-muted-foreground/80 normal-case tracking-normal font-body text-xs">
                    (optional)
                  </span>
                </label>
                <RelatedWordsSelect value={relatedWords} onChange={setRelatedWords} />
              </div>

              {/* ── Region + Name in a row ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Region */}
                <div className="space-y-1.5">
                  <label className="block font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground/80">
                    Region
                  </label>
                  <div className="relative">
                    <select
                      value={form.region}
                      onChange={set('region')}
                      className={`${inputClass} h-12 appearance-none cursor-pointer pr-10`}
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                    >
                      {REGION_OPTIONS.map((r) => (
                        <option key={r} value={r} style={{ background: '#111' }}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="block font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground/80">
                    Your name
                    <span className="ml-2 text-muted-foreground/80 normal-case tracking-normal font-body text-xs">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.submittedBy}
                    onChange={set('submittedBy')}
                    placeholder="Anonymous"
                    autoComplete="name"
                    className={`${inputClass} h-12`}
                  />
                </div>
              </div>

              {/* ── Submit ── */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === 'submitting' || !form.word.trim() || !form.definition.trim() || !form.partOfSpeech}
                  className="
                    w-full h-14 flex items-center justify-center gap-2
                    bg-[#c8f135] text-black
                    font-display font-bold text-sm uppercase tracking-wider
                    rounded-xl
                    hover:bg-[#d4f545] active:scale-[0.99]
                    transition-all duration-150
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
                  "
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    'Submit word'
                  )}
                </button>
                <p className="mt-3 text-center text-muted-foreground/80 text-[11px] font-mono">
                  All submissions are reviewed before going live.
                </p>
              </div>
            </form>
          </main>

          {/* Footer */}
          <footer className="border-t border-white/5 mt-8">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="font-display font-black text-lg uppercase">
                SHENG<span className="text-[#c8f135]">.</span>
              </span>
              <p className="text-muted-foreground/80 text-xs font-mono">
                © {new Date().getFullYear()} Sheng Dictionary. Built in Nairobi.
              </p>
            </div>
          </footer>
        </>
      )}
    </div>
  )
}

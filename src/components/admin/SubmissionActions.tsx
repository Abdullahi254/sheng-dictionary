'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Loader2, Pencil, ChevronDown } from 'lucide-react'
import { TagsInput } from '@/components/words/TagsInput'
import { RelatedWordsSelect } from '@/components/words/RelatedWordsSelect'
import type { PartOfSpeech } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

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

export interface SubmissionInitialData {
  word: string
  slug: string
  partOfSpeech: PartOfSpeech
  meaning: string
  example: string
  origin: string
  tags: string[]
  relatedWords: string[]
  region: string
}

interface SubmissionActionsProps {
  id: string
  initialData: SubmissionInitialData
}

type ActionStatus = 'idle' | 'approving' | 'rejecting' | 'approved' | 'rejected' | 'error'

// ─── Shared input style ───────────────────────────────────────────────────────

const inputClass = `
  w-full px-3 bg-white/5 border border-white/8 rounded-lg text-sm text-foreground
  placeholder:text-muted-foreground/60 outline-none font-body
  transition-all duration-200
  focus:border-[#c8f135]/30 focus:bg-white/6
`

// ─── Component ────────────────────────────────────────────────────────────────

export function SubmissionActions({ id, initialData }: SubmissionActionsProps) {
  const router = useRouter()

  // ── Approve / reject state ─────────────────────────────────────────────────
  const [actionStatus, setActionStatus] = useState<ActionStatus>('idle')
  const [actionError, setActionError] = useState('')

  // ── Edit state ─────────────────────────────────────────────────────────────
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [word, setWord] = useState(initialData.word)
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech>(initialData.partOfSpeech)
  const [meaning, setMeaning] = useState(initialData.meaning)
  const [example, setExample] = useState(initialData.example)
  const [origin, setOrigin] = useState(initialData.origin)
  const [tags, setTags] = useState<string[]>(initialData.tags)
  const [relatedWords, setRelatedWords] = useState<string[]>(initialData.relatedWords)
  const [region, setRegion] = useState(initialData.region)

  // ── Helpers ────────────────────────────────────────────────────────────────

  function cancelEdit() {
    setWord(initialData.word)
    setPartOfSpeech(initialData.partOfSpeech)
    setMeaning(initialData.meaning)
    setExample(initialData.example)
    setOrigin(initialData.origin)
    setTags(initialData.tags)
    setRelatedWords(initialData.relatedWords)
    setRegion(initialData.region)
    setSaveError('')
    setEditing(false)
  }

  async function handleSave() {
    setSaving(true)
    setSaveError('')

    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, partOfSpeech, meaning, example, origin, tags, relatedWords, region }),
      })
      const data = (await res.json()) as { success: boolean; error?: string }

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? 'Failed to save changes')
      }

      setEditing(false)
      router.refresh()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function handleAction(action: 'approve' | 'reject') {
    setActionStatus(action === 'approve' ? 'approving' : 'rejecting')
    setActionError('')

    try {
      const res = await fetch(`/api/admin/submissions/${id}/${action}`, { method: 'POST' })
      const data = (await res.json()) as { success: boolean; error?: string }

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? 'Action failed')
      }

      setActionStatus(action === 'approve' ? 'approved' : 'rejected')
      router.refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong')
      setActionStatus('error')
    }
  }

  // ── Terminal states ────────────────────────────────────────────────────────

  if (actionStatus === 'approved') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[#c8f135] text-xs font-mono">
        <Check className="w-3.5 h-3.5" /> Approved
      </span>
    )
  }

  if (actionStatus === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1.5 text-muted-foreground/80 text-xs font-mono">
        <X className="w-3.5 h-3.5" /> Rejected
      </span>
    )
  }

  const busy = actionStatus === 'approving' || actionStatus === 'rejecting'

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="w-full space-y-4">

      {/* ── Inline edit panel ─────────────────────────────────────────────── */}
      {editing && (
        <div className="pt-4 border-t border-white/6 space-y-5">
          <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#c8f135]">
            Edit submission
          </p>

          {/* Word */}
          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground/80">
              Word
            </label>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              spellCheck={false}
              autoComplete="off"
              className={`${inputClass} h-11 font-display font-bold uppercase tracking-wide text-base`}
            />
          </div>

          {/* Part of speech */}
          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground/80">
              Part of speech
            </label>
            <div className="relative">
              <select
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value as PartOfSpeech)}
                className={`${inputClass} h-11 appearance-none cursor-pointer pr-9`}
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                {POS_OPTIONS.map(({ value: v, label }) => (
                  <option key={v} value={v} style={{ background: '#111' }}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60 pointer-events-none" />
            </div>
          </div>

          {/* Meaning */}
          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground/80">
              Meaning
            </label>
            <textarea
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              rows={3}
              className={`${inputClass} py-2.5 resize-none leading-relaxed`}
            />
          </div>

          {/* Example */}
          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground/80">
              Example sentence
              <span className="ml-1.5 normal-case tracking-normal font-body text-[10px]">(optional)</span>
            </label>
            <textarea
              value={example}
              onChange={(e) => setExample(e.target.value)}
              rows={2}
              className={`${inputClass} py-2.5 resize-none leading-relaxed`}
              placeholder="Show how the word is used in a sentence."
            />
          </div>

          {/* Etymology / origin */}
          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground/80">
              Etymology / origin
              <span className="ml-1.5 normal-case tracking-normal font-body text-[10px]">(optional)</span>
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. Derived from Kiswahili…"
              className={`${inputClass} h-11`}
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground/80">
              Tags
            </label>
            <TagsInput value={tags} onChange={setTags} />
          </div>

          {/* Related words */}
          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground/80">
              Related words
            </label>
            <RelatedWordsSelect value={relatedWords} onChange={setRelatedWords} excludeSlug={initialData.slug} />
          </div>

          {/* Region */}
          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground/80">
              Region
            </label>
            <div className="relative">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className={`${inputClass} h-11 appearance-none cursor-pointer pr-9`}
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                {REGION_OPTIONS.map((r) => (
                  <option key={r} value={r} style={{ background: '#111' }}>
                    {r}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60 pointer-events-none" />
            </div>
          </div>

          {/* Save / cancel */}
          {saveError && (
            <p className="text-red-400/80 text-xs font-mono">{saveError}</p>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || !word.trim() || !meaning.trim()}
              className="
                inline-flex items-center gap-1.5 h-9 px-4
                bg-[#c8f135] text-black
                font-display font-bold text-xs uppercase tracking-wider
                rounded-lg hover:bg-[#d4f545] active:scale-95
                transition-all duration-150
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Save changes
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={saving}
              className="
                inline-flex items-center gap-1.5 h-9 px-4
                border border-white/10 text-muted-foreground/80
                font-mono text-xs uppercase tracking-wider
                rounded-lg hover:border-white/20
                active:scale-95 transition-all duration-150
                disabled:opacity-50
              "
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Action row ────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-start gap-2">
        {actionError && (
          <p className="text-red-400/80 text-xs font-mono">{actionError}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap">

          {/* Approve */}
          <button
            onClick={() => void handleAction('approve')}
            disabled={busy || editing}
            className="
              inline-flex items-center gap-1.5 h-8 px-3.5
              bg-[#c8f135] text-black
              font-display font-bold text-xs uppercase tracking-wider
              rounded-lg hover:bg-[#d4f545] active:scale-95
              transition-all duration-150
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {actionStatus === 'approving'
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Check className="w-3.5 h-3.5" />}
            Approve
          </button>

          {/* Edit / close edit */}
          <button
            type="button"
            onClick={() => editing ? cancelEdit() : setEditing(true)}
            disabled={busy}
            className="
              inline-flex items-center gap-1.5 h-8 px-3.5
              bg-white/5 border border-white/10 text-muted-foreground/80
              font-display font-bold text-xs uppercase tracking-wider
              rounded-lg
              hover:border-[#c8f135]/30 hover:text-[#c8f135] hover:bg-[#c8f135]/5
              active:scale-95 transition-all duration-150
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <Pencil className="w-3.5 h-3.5" />
            {editing ? 'Close editor' : 'Edit'}
          </button>

          {/* Reject */}
          <button
            onClick={() => void handleAction('reject')}
            disabled={busy || editing}
            className="
              inline-flex items-center gap-1.5 h-8 px-3.5
              bg-white/5 border border-white/10 text-muted-foreground/80
              font-display font-bold text-xs uppercase tracking-wider
              rounded-lg
              hover:border-red-500/30 hover:text-red-400/80 hover:bg-red-500/5
              active:scale-95 transition-all duration-150
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {actionStatus === 'rejecting'
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <X className="w-3.5 h-3.5" />}
            Reject
          </button>

        </div>
      </div>
    </div>
  )
}

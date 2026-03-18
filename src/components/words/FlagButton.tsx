'use client'

import { useState } from 'react'
import { Flag, Loader2, ChevronDown, CheckCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { FlagReason } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const REASON_OPTIONS: { value: FlagReason; label: string }[] = [
  { value: 'not_sheng', label: 'Not actually Sheng' },
  { value: 'mistranslation', label: 'Wrong or misleading translation' },
  { value: 'offensive', label: 'Offensive or inappropriate' },
  { value: 'outdated', label: 'Outdated / no longer used' },
  { value: 'other', label: 'Other' },
]

const inputClass = 'w-full px-3 py-2.5 bg-white/5 border border-white/8 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 outline-none font-body transition-all duration-200 focus:border-[#c8f135]/30 focus:bg-white/6'

// ─── Types ────────────────────────────────────────────────────────────────────

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

interface FlagButtonProps {
  slug: string
  wordName: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FlagButton({ slug, wordName }: FlagButtonProps) {
  const [open, setOpen] = useState(false)
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [reason, setReason] = useState<FlagReason>('not_sheng')
  const [suggestion, setSuggestion] = useState('')
  const [reportedBy, setReportedBy] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  function handleOpenChange(val: boolean) {
    // Reset form state when dialog closes
    if (!val) {
      setTimeout(() => {
        setReason('not_sheng')
        setSuggestion('')
        setReportedBy('')
        setErrorMsg('')
        setSubmitState('idle')
      }, 200) // wait for close animation
    }
    setOpen(val)
  }

  async function handleSubmit() {
    setSubmitState('submitting')
    setErrorMsg('')

    try {
      const res = await fetch(`/api/words/${slug}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, suggestion: suggestion.trim(), reportedBy: reportedBy.trim() }),
      })
      const data = (await res.json()) as { success: boolean; error?: string }

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? 'Failed to submit flag')
      }

      setSubmitState('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitState('error')
    }
  }

  const busy = submitState === 'submitting'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-[#1a1a1a] border-[#2a2a2a] text-muted-foreground/70 hover:border-red-500/40 hover:text-red-400/80 hover:bg-[#1a1a1a] transition-all duration-200">
          <Flag className="w-4 h-4" />
          Flag
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-[#0f0f0f] border-white/10 max-w-md p-0 overflow-hidden">

        {/* ── Success state ── */}
        {submitState === 'success' ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12 px-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#c8f135]/10 border border-[#c8f135]/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-[#c8f135]" />
            </div>
            <div>
              <p className="font-display font-black text-2xl uppercase tracking-tight mb-1">Flagged.</p>
              <p className="text-muted-foreground/70 text-sm font-body">We&apos;ll review <span className="text-foreground/80">&ldquo;{wordName}&rdquo;</span> and update it if needed.</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-2 text-[10px] font-mono tracking-[0.3em] uppercase text-muted-foreground/50 hover:text-muted-foreground/80 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* ── Header ── */}
            <DialogHeader className="px-6 pt-6 pb-0">
              <div className="flex items-center gap-2 mb-1">
                <Flag className="w-3.5 h-3.5 text-red-400/70" />
                <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-red-400/70">Report an issue</p>
              </div>
              <DialogTitle className="font-display font-black text-2xl uppercase tracking-tight">
                Flag &ldquo;{wordName}&rdquo;
              </DialogTitle>
              <DialogDescription className="text-muted-foreground/60 text-sm font-body leading-relaxed">
                Think this definition is wrong, outdated, or not Sheng? Let us know.
              </DialogDescription>
            </DialogHeader>

            {/* ── Form ── */}
            <div className="px-6 py-5 space-y-4">

              {/* Reason */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground/70">
                  What&apos;s wrong?
                </label>
                <div className="relative">
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value as FlagReason)}
                    disabled={busy}
                    className={`${inputClass} appearance-none cursor-pointer pr-9`}
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  >
                    {REASON_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value} style={{ background: '#111' }}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 pointer-events-none" />
                </div>
              </div>

              {/* Suggestion */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground/70">
                  Suggestion
                  <span className="ml-2 normal-case tracking-normal font-body text-[10px] text-muted-foreground/50">(optional)</span>
                </label>
                <textarea
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  rows={3}
                  disabled={busy}
                  placeholder="What should the correct definition be?"
                  className={`${inputClass} resize-none leading-relaxed`}
                />
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground/70">
                  Your name
                  <span className="ml-2 normal-case tracking-normal font-body text-[10px] text-muted-foreground/50">(optional)</span>
                </label>
                <input
                  type="text"
                  value={reportedBy}
                  onChange={(e) => setReportedBy(e.target.value)}
                  disabled={busy}
                  placeholder="Anonymous"
                  autoComplete="name"
                  className={`${inputClass} h-10`}
                />
              </div>

              {/* Error */}
              {submitState === 'error' && errorMsg && (
                <p className="text-red-400/80 text-xs font-mono">{errorMsg}</p>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="px-6 pb-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={busy}
                className="text-[10px] font-mono tracking-[0.3em] uppercase text-muted-foreground/50 hover:text-muted-foreground/80 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={busy}
                className="inline-flex items-center gap-2 h-9 px-5 bg-red-500/15 border border-red-500/30 text-red-400 font-display font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-red-500/25 hover:border-red-500/50 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Flag className="w-3.5 h-3.5" />}
                {busy ? 'Submitting…' : 'Submit flag'}
              </button>
            </div>
          </>
        )}

      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState } from 'react'
import { Flag, Loader2 } from 'lucide-react'
import type { FlagReason } from '@/types'

const REASON_OPTIONS: { value: FlagReason; label: string }[] = [
  { value: 'not_sheng', label: 'Not actually Sheng' },
  { value: 'mistranslation', label: 'Wrong or misleading translation' },
  { value: 'offensive', label: 'Offensive or inappropriate' },
  { value: 'outdated', label: 'Outdated / no longer used' },
  { value: 'other', label: 'Other' },
]

type UIState = 'idle' | 'open' | 'submitting' | 'success' | 'error'

interface FlagButtonProps {
  slug: string
  wordName: string
}

const inputClass = 'w-full px-3 py-2 bg-white/5 border border-white/8 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/60 outline-none font-body transition-all duration-200 focus:border-[#c8f135]/30 focus:bg-white/6'

export function FlagButton({ slug, wordName }: FlagButtonProps) {
  const [uiState, setUiState] = useState<UIState>('idle')
  const [reason, setReason] = useState<FlagReason>('not_sheng')
  const [suggestion, setSuggestion] = useState('')
  const [reportedBy, setReportedBy] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  function openForm() {
    setUiState('open')
  }

  function closeForm() {
    setReason('not_sheng')
    setSuggestion('')
    setReportedBy('')
    setErrorMsg('')
    setUiState('idle')
  }

  async function handleSubmit() {
    setUiState('submitting')
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

      setUiState('success')
      setTimeout(() => {
        setUiState('idle')
        setReason('not_sheng')
        setSuggestion('')
        setReportedBy('')
      }, 3000)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      setUiState('error')
    }
  }

  if (uiState === 'success') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.25em] uppercase text-muted-foreground/35">
        <Flag className="w-3.5 h-3.5" />
        Flagged. We&apos;ll review it soon.
      </span>
    )
  }

  return (
    <div>
      {/* Idle trigger button */}
      <button
        type="button"
        onClick={uiState === 'open' || uiState === 'error' ? closeForm : openForm}
        className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.25em] uppercase text-muted-foreground/35 hover:text-red-400/60 transition-colors"
      >
        <Flag className="w-3.5 h-3.5" />
        {uiState === 'open' || uiState === 'error' ? 'Cancel' : `Flag ${wordName}`}
      </button>

      {/* Form panel */}
      {(uiState === 'open' || uiState === 'submitting' || uiState === 'error') && (
        <div className="mt-3 p-4 bg-[#111111] border border-white/8 rounded-xl space-y-3">
          {/* Reason */}
          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground/80">
              Reason
            </label>
            <div className="relative">
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as FlagReason)}
                disabled={uiState === 'submitting'}
                className={`${inputClass} appearance-none cursor-pointer pr-8`}
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                {REASON_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value} style={{ background: '#111' }}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Suggestion */}
          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground/80">
              Suggestion <span className="normal-case tracking-normal font-body text-[10px] ml-1">(optional)</span>
            </label>
            <textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              rows={2}
              disabled={uiState === 'submitting'}
              placeholder="What should it say instead?"
              className={`${inputClass} resize-none leading-relaxed`}
            />
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground/80">
              Your name <span className="normal-case tracking-normal font-body text-[10px] ml-1">(optional)</span>
            </label>
            <input
              type="text"
              value={reportedBy}
              onChange={(e) => setReportedBy(e.target.value)}
              disabled={uiState === 'submitting'}
              placeholder="Anonymous"
              className={`${inputClass} h-9`}
            />
          </div>

          {/* Error */}
          {uiState === 'error' && errorMsg && (
            <p className="text-red-400/80 text-xs font-mono">{errorMsg}</p>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={uiState === 'submitting'}
              className="inline-flex items-center gap-1.5 h-8 px-3.5 bg-red-500/80 text-white font-mono text-xs uppercase tracking-wider rounded-lg hover:bg-red-500 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uiState === 'submitting' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Flag className="w-3.5 h-3.5" />}
              Submit flag
            </button>
            <button
              type="button"
              onClick={closeForm}
              disabled={uiState === 'submitting'}
              className="inline-flex items-center h-8 px-3.5 border border-white/10 text-muted-foreground/80 font-mono text-xs uppercase tracking-wider rounded-lg hover:border-white/20 active:scale-95 transition-all duration-150 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = (await res.json()) as { success: boolean; error?: string }

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? 'Something went wrong. Please try again.')
      }

      setStatus('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#c8f135]">
          You&apos;re in
        </p>
        <p className="text-muted-foreground/80 text-sm font-body">
          Daily Sheng word hits your inbox every morning.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          autoComplete="email"
          className="
            flex-1 px-4 h-11 bg-white/5 border border-white/10 rounded-xl
            text-sm text-foreground placeholder:text-muted-foreground/60
            outline-none font-body
            transition-all duration-200
            focus:border-[#c8f135]/30 focus:bg-white/6
          "
        />
        <button
          type="submit"
          disabled={status === 'loading' || !email.trim()}
          className="
            h-11 px-5 flex items-center gap-2 shrink-0
            bg-[#c8f135] text-black
            font-display font-bold text-xs uppercase tracking-wider
            rounded-xl
            hover:bg-[#d4f545] active:scale-[0.98]
            transition-all duration-150
            disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
          "
        >
          {status === 'loading' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            'Subscribe'
          )}
        </button>
      </div>

      {status === 'error' && errorMsg && (
        <p className="mt-2 text-red-400/80 text-xs font-mono">{errorMsg}</p>
      )}

      <p className="mt-3 text-center text-muted-foreground/60 text-[10px] font-mono">
        One word a day. Unsubscribe anytime.
      </p>
    </form>
  )
}

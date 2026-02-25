'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

type Status = 'idle' | 'loading' | 'sent' | 'error'

export default function AdminLoginPage() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/admin'
  // NextAuth passes error codes via ?error= on redirect
  const urlError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>(urlError ? 'error' : 'idle')
  const [errorMsg, setErrorMsg] = useState(
    urlError === 'AccessDenied'
      ? 'This email is not authorised to access admin.'
      : urlError
        ? 'An error occurred. Please try again.'
        : '',
  )

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return

    setStatus('loading')
    setErrorMsg('')

    try {
      const result = await signIn('email', {
        email: trimmed,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setErrorMsg(
          result.error === 'AccessDenied'
            ? 'This email is not authorised to access admin.'
            : 'Something went wrong. Please try again.',
        )
        setStatus('error')
      } else {
        setStatus('sent')
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">

      {/* Back to site */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground/80 hover:text-[#c8f135] transition-colors"
      >
        <ArrowLeft className="w-3 h-3" />
        Back to site
      </Link>

      {/* Card */}
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-10 text-center">
          <Link href="/" className="font-display font-black text-2xl uppercase">
            SHENG<span className="text-[#c8f135]">.</span>
          </Link>
        </div>

        {/* Divider label */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-px bg-white/8" />
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-muted-foreground/80 shrink-0">
            Admin Access
          </span>
          <div className="flex-1 h-px bg-white/8" />
        </div>

        {/* ── SENT STATE ── */}
        {status === 'sent' ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-[#c8f135]/10 border border-[#c8f135]/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[#c8f135]" />
              </div>
            </div>
            <div>
              <h1 className="font-display font-black text-2xl uppercase tracking-tight mb-2">
                Check your inbox
              </h1>
              <p className="text-muted-foreground/80 text-sm leading-relaxed font-body">
                If <span className="text-foreground/80">{email}</span> is authorised,
                a sign-in link is on its way.
              </p>
              <p className="text-muted-foreground/80 text-xs mt-3 font-mono">
                The link expires in 24 hours.
              </p>
            </div>
            <button
              onClick={() => { setStatus('idle'); setEmail('') }}
              className="text-[11px] font-mono tracking-wider uppercase text-muted-foreground/80 hover:text-[#c8f135] transition-colors"
            >
              Try a different email
            </button>
          </div>
        ) : (
          /* ── FORM STATE ── */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h1 className="font-display font-black text-3xl uppercase tracking-tight mb-2 leading-none">
                Sign in
              </h1>
              <p className="text-muted-foreground/80 text-sm font-body leading-relaxed">
                Enter your admin email to receive a secure magic link.
              </p>
            </div>

            {/* Error banner */}
            {status === 'error' && errorMsg && (
              <div className="flex items-start gap-2.5 bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-400/80 shrink-0 mt-0.5" />
                <p className="text-red-400/80 text-xs font-mono leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {/* Email input */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                autoComplete="email"
                autoFocus
                className="
                  w-full h-12 pl-11 pr-4
                  bg-white/5 border border-white/8
                  rounded-xl text-sm text-foreground
                  placeholder:text-muted-foreground/80
                  outline-none font-body
                  transition-all duration-200
                  focus:border-[#c8f135]/30 focus:bg-white/6
                "
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={status === 'loading' || !email.trim()}
              className="
                w-full h-12 flex items-center justify-center gap-2
                bg-[#c8f135] text-black
                font-display font-bold text-sm uppercase tracking-wider
                rounded-xl
                hover:bg-[#d4f545] active:scale-[0.98]
                transition-all duration-150
                disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
              "
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending…
                </>
              ) : (
                'Send magic link'
              )}
            </button>

            <p className="text-center text-muted-foreground/80 text-[11px] font-mono pt-1">
              Only the registered admin email can sign in.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

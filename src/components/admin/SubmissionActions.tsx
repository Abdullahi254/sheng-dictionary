'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Loader2 } from 'lucide-react'

interface SubmissionActionsProps {
  id: string
}

type Status = 'idle' | 'approving' | 'rejecting' | 'approved' | 'rejected' | 'error'

export function SubmissionActions({ id }: SubmissionActionsProps) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleAction(action: 'approve' | 'reject') {
    setStatus(action === 'approve' ? 'approving' : 'rejecting')
    setErrorMsg('')

    try {
      const res = await fetch(`/api/admin/submissions/${id}/${action}`, {
        method: 'POST',
      })
      const data = (await res.json()) as { success: boolean; error?: string }

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? 'Action failed')
      }

      setStatus(action === 'approve' ? 'approved' : 'rejected')
      // Refresh the server component to remove the processed submission
      router.refresh()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  if (status === 'approved') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[#c8f135] text-xs font-mono">
        <Check className="w-3.5 h-3.5" /> Approved
      </span>
    )
  }

  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1.5 text-muted-foreground/80 text-xs font-mono">
        <X className="w-3.5 h-3.5" /> Rejected
      </span>
    )
  }

  const busy = status === 'approving' || status === 'rejecting'

  return (
    <div className="flex flex-col items-start gap-2">
      {errorMsg && (
        <p className="text-red-400/80 text-xs font-mono">{errorMsg}</p>
      )}
      <div className="flex items-center gap-2">
        {/* Approve */}
        <button
          onClick={() => handleAction('approve')}
          disabled={busy}
          className="
            inline-flex items-center gap-1.5
            h-8 px-3.5
            bg-[#c8f135] text-black
            font-display font-bold text-xs uppercase tracking-wider
            rounded-lg
            hover:bg-[#d4f545] active:scale-95
            transition-all duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {status === 'approving' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          Approve
        </button>

        {/* Reject */}
        <button
          onClick={() => handleAction('reject')}
          disabled={busy}
          className="
            inline-flex items-center gap-1.5
            h-8 px-3.5
            bg-white/5 border border-white/10 text-muted-foreground/80
            font-display font-bold text-xs uppercase tracking-wider
            rounded-lg
            hover:border-red-500/30 hover:text-red-400/80 hover:bg-red-500/5
            active:scale-95
            transition-all duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {status === 'rejecting' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <X className="w-3.5 h-3.5" />
          )}
          Reject
        </button>
      </div>
    </div>
  )
}

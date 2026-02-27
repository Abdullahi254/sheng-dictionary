'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'

function VerifyContent() {
  const searchParams = useSearchParams()

  // Reconstruct the actual NextAuth callback URL from the current query params
  const params = searchParams.toString()
  const callbackUrl = `/api/auth/callback/email?${params}`

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <p className="text-[#c8f135] text-xs tracking-[0.5em] uppercase font-semibold font-body">
          Sheng Dictionary · Admin
        </p>

        <h1 className="font-display text-4xl font-black uppercase text-[#f0ede8] tracking-tight">
          Confirm Sign In
        </h1>

        <p className="text-[#888] text-sm leading-relaxed font-body">
          Click the button below to complete your sign-in to the admin dashboard.
        </p>

        <a href={callbackUrl} className="block">
          <Button className="w-full bg-[#c8f135] text-black font-bold uppercase tracking-widest text-sm hover:bg-[#d4f550]">
            Complete Sign In →
          </Button>
        </a>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  )
}

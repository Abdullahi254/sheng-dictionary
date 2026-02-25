'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/admin/login' })}
      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-muted-foreground/80 hover:text-foreground/80 hover:bg-white/5 transition-all text-sm font-mono tracking-wide"
    >
      <LogOut className="w-3.5 h-3.5 shrink-0" />
      Sign out
    </button>
  )
}

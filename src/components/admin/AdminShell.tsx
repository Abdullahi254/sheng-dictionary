'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Inbox, Menu, X, Flag } from 'lucide-react'
import { SignOutButton } from '@/components/admin/SignOutButton'

// Nav links are defined here (client side) so icon components never cross
// the server→client boundary.
const NAV_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, badgeKey: null },
  { href: '/admin/submissions', label: 'Submissions', icon: Inbox, badgeKey: 'pendingCount' as const },
  { href: '/admin/flags', label: 'Flags', icon: Flag, badgeKey: 'flagsCount' as const },
]

interface AdminShellProps {
  children: React.ReactNode
  pendingCount: number
  flagsCount: number
  email: string
}

export function AdminShell({ children, pendingCount, flagsCount, email }: AdminShellProps) {
  const badges: Record<string, number> = { pendingCount, flagsCount }
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/6 flex items-center justify-between">
        <div>
          <Link
            href="/admin"
            className="font-display font-black text-lg uppercase"
            onClick={() => setDrawerOpen(false)}
          >
            SHENG<span className="text-[#c8f135]">.</span>
          </Link>
          <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-muted-foreground/80 mt-0.5">
            Admin
          </p>
        </div>
        {/* Close button — mobile only */}
        <button
          className="lg:hidden p-1.5 rounded-lg text-muted-foreground/80 hover:text-foreground/80 hover:bg-white/5 transition-all"
          onClick={() => setDrawerOpen(false)}
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_LINKS.map(({ href, label, icon: Icon, badgeKey }) => {
          const active = pathname === href
          const badge = badgeKey ? badges[badgeKey] : 0
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg
                text-sm font-mono transition-all group
                ${active
                  ? 'bg-white/8 text-foreground/90'
                  : 'text-muted-foreground/80 hover:text-foreground/80 hover:bg-white/5'
                }
              `}
            >
              <span className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
              </span>
              {badge > 0 && (
                <span className="text-[10px] font-bold bg-[#c8f135] text-black rounded-full px-1.5 py-0.5 leading-none min-w-4.5 text-center">
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User + sign-out */}
      <div className="px-3 py-4 border-t border-white/6 space-y-1">
        <p className="px-3 text-[10px] font-mono text-muted-foreground/80 truncate">
          {email}
        </p>
        <SignOutButton />
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-background">

      {/* ── MOBILE TOP BAR ──────────────────────────────────────────── */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-[#080808]/95 backdrop-blur-xl border-b border-white/6">
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-1.5 -ml-1.5 rounded-lg text-muted-foreground/80 hover:text-foreground/80 hover:bg-white/5 transition-all"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/admin" className="font-display font-black text-base uppercase">
          SHENG<span className="text-[#c8f135]">.</span>
        </Link>

        {/* Badge shortcut — show highest count */}
        {pendingCount > 0 || flagsCount > 0 ? (
          <Link
            href={flagsCount >= pendingCount ? '/admin/flags' : '/admin/submissions'}
            className="flex items-center gap-1.5 text-[10px] font-bold bg-[#c8f135] text-black rounded-full px-2 py-1 leading-none"
          >
            {flagsCount >= pendingCount ? <Flag className="w-3 h-3" /> : <Inbox className="w-3 h-3" />}
            {Math.max(pendingCount, flagsCount)}
          </Link>
        ) : (
          <div className="w-8" aria-hidden />
        )}
      </header>

      <div className="flex">

        {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────── */}
        <aside className="hidden lg:flex w-56 shrink-0 border-r border-white/6 flex-col sticky top-0 h-screen">
          {sidebarContent}
        </aside>

        {/* ── MOBILE DRAWER ───────────────────────────────────────────── */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            {/* Drawer panel */}
            <aside className="absolute left-0 top-0 h-full w-64 bg-[#0a0a0a] border-r border-white/8 flex flex-col shadow-2xl">
              {sidebarContent}
            </aside>
          </div>
        )}

        {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>

      </div>
    </div>
  )
}

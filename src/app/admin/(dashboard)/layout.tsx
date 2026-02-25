import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { LayoutDashboard, Inbox } from 'lucide-react'

import { authOptions } from '@/lib/auth'
import { SignOutButton } from '@/components/admin/SignOutButton'
import connectToDatabase from '@/lib/mongodb'
import Submission from '@/models/Submission'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Defense-in-depth: middleware also guards these routes, but we verify
  // the session here too so every admin server component is self-protecting.
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  await connectToDatabase()
  const pendingCount = await Submission.countDocuments({ status: 'pending' })

  const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/submissions', label: 'Submissions', icon: Inbox, badge: pendingCount },
  ]

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
      <aside className="w-56 shrink-0 border-r border-white/6 flex flex-col sticky top-0 h-screen">

        {/* Logo */}
        <div className="px-4 py-5 border-b border-white/6">
          <Link href="/admin" className="font-display font-black text-lg uppercase">
            SHENG<span className="text-[#c8f135]">.</span>
          </Link>
          <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-muted-foreground/80 mt-0.5">
            Admin
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map(({ href, label, icon: Icon, badge }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-mono text-muted-foreground/80 hover:text-foreground/80 hover:bg-white/5 transition-all group"
            >
              <span className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
              </span>
              {badge != null && badge > 0 && (
                <span className="text-[10px] font-bold bg-[#c8f135] text-black rounded-full px-1.5 py-0.5 leading-none min-w-[18px] text-center">
                  {badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User + sign-out */}
        <div className="px-3 py-4 border-t border-white/6 space-y-1">
          <p className="px-3 text-[10px] font-mono text-muted-foreground/80 truncate">
            {session.user?.email}
          </p>
          <SignOutButton />
        </div>
      </aside>

      {/* ── MAIN CONTENT ──────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 p-8">
        {children}
      </main>
    </div>
  )
}

import Link from 'next/link'
import { FileText, Inbox, Users, ArrowRight } from 'lucide-react'

import connectToDatabase from '@/lib/mongodb'
import Word from '@/models/Word'
import Submission from '@/models/Submission'
import Subscriber from '@/models/Subscriber'

// Session is already verified by the admin layout — no need to repeat it here.

async function getStats() {
  await connectToDatabase()
  const [approvedWords, pendingSubmissions, activeSubscribers] = await Promise.all([
    Word.countDocuments({ status: 'approved' }),
    Submission.countDocuments({ status: 'pending' }),
    Subscriber.countDocuments({ isActive: true }),
  ])
  return { approvedWords, pendingSubmissions, activeSubscribers }
}

export default async function AdminPage() {
  const { approvedWords, pendingSubmissions, activeSubscribers } = await getStats()

  const stats = [
    {
      label: 'Approved Words',
      value: approvedWords,
      icon: FileText,
      href: null,
      accent: false,
    },
    {
      label: 'Pending Submissions',
      value: pendingSubmissions,
      icon: Inbox,
      href: '/admin/submissions',
      accent: pendingSubmissions > 0,
    },
    {
      label: 'Active Subscribers',
      value: activeSubscribers,
      icon: Users,
      href: null,
      accent: false,
    },
  ]

  return (
    <div className="max-w-4xl space-y-10">

      {/* Page header */}
      <div>
        <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-muted-foreground/80 mb-2">
          Admin
        </p>
        <h1 className="font-display font-black text-4xl uppercase tracking-tight">
          Overview
        </h1>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, href, accent }) => {
          const card = (
            <div
              className={`
                relative p-6 rounded-xl border transition-colors duration-200
                ${accent
                  ? 'bg-[#c8f135]/5 border-[#c8f135]/20 hover:border-[#c8f135]/35'
                  : 'bg-[#111111] border-white/6 hover:border-white/10'
                }
              `}
            >
              <div className="flex items-start justify-between mb-4">
                <Icon className={`w-4 h-4 ${accent ? 'text-[#c8f135]' : 'text-muted-foreground/80'}`} />
                {href && (
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
              <p
                className={`font-display font-black text-5xl leading-none tracking-tight mb-2 ${accent ? 'text-[#c8f135]' : 'text-foreground'}`}
              >
                {value.toLocaleString()}
              </p>
              <p className="text-muted-foreground/80 text-xs font-mono tracking-wider uppercase">
                {label}
              </p>
            </div>
          )

          return href ? (
            <Link key={label} href={href} className="group">
              {card}
            </Link>
          ) : (
            <div key={label}>{card}</div>
          )
        })}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-display font-black text-[11px] uppercase tracking-[0.35em] text-muted-foreground/80 mb-4">
          Quick Actions
        </h2>
        <div className="space-y-2">
          <Link
            href="/admin/submissions"
            className="flex items-center justify-between px-5 py-4 bg-[#111111] border border-white/6 rounded-xl hover:border-white/10 hover:bg-[#141414] transition-all group"
          >
            <div className="flex items-center gap-3">
              <Inbox className="w-4 h-4 text-muted-foreground/80" />
              <span className="text-sm font-mono text-foreground/80">
                Review pending submissions
              </span>
              {pendingSubmissions > 0 && (
                <span className="text-[10px] font-bold bg-[#c8f135] text-black rounded-full px-2 py-0.5">
                  {pendingSubmissions} waiting
                </span>
              )}
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground/80 group-hover:text-[#c8f135] transition-colors" />
          </Link>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-5 py-4 bg-[#111111] border border-white/6 rounded-xl hover:border-white/10 hover:bg-[#141414] transition-all group"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-muted-foreground/80" />
              <span className="text-sm font-mono text-foreground/80">
                View public site
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground/80 group-hover:text-[#c8f135] transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  )
}

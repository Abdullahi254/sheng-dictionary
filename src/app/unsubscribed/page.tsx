import Link from 'next/link'
import { Navbar } from '@/components/shared/Navbar'

export default function UnsubscribedPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <p className="font-mono text-[10px] tracking-[0.5em] uppercase text-[#c8f135] mb-6">
          Unsubscribed
        </p>
        <h1
          className="font-display font-black uppercase leading-none tracking-tight mb-6"
          style={{ fontSize: 'clamp(56px, 12vw, 120px)' }}
        >
          Sawa<span className="text-[#c8f135]">.</span>
        </h1>
        <p className="text-muted-foreground/80 text-base font-body max-w-sm mx-auto leading-relaxed mb-10">
          You&apos;ve been removed from the daily word list. You won&apos;t hear from us again —
          unless you subscribe again.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 text-muted-foreground/80 font-mono text-xs uppercase tracking-wider rounded-xl hover:border-white/20 hover:text-foreground/80 transition-all"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}

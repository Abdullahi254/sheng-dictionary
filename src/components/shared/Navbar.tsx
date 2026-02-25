import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080808]/90 backdrop-blur-xl border-b border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          href="/"
          className="font-display font-black text-2xl uppercase tracking-tight text-foreground hover:text-foreground transition-colors"
        >
          SHENG<span className="text-[#c8f135]">.</span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-6">
          <Link
            href="/browse"
            className="hidden sm:block text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
          >
            Browse
          </Link>
          <Link
            href="/submit"
            className="text-xs font-mono tracking-wider uppercase px-4 py-2 border border-[#c8f135]/25 text-[#c8f135] rounded-lg hover:bg-[#c8f135]/10 transition-colors"
          >
            Submit a Word
          </Link>
        </div>
      </div>
    </nav>
  )
}

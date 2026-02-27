import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="font-display font-black text-xl uppercase">
            SHENG<span className="text-[#c8f135]">.</span>
          </span>
          <p className="text-muted-foreground/80 text-xs mt-1 font-mono tracking-wide">
            Nairobi&apos;s unofficial official dictionary.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <Link
            href="/privacy-policy"
            className="text-muted-foreground/60 text-xs font-mono tracking-wide hover:text-muted-foreground transition-colors"
          >
            Privacy Policy
          </Link>
          <p className="text-muted-foreground/80 text-xs font-mono">
            © {new Date().getFullYear()} Sheng Dictionary. Built in Nairobi.
          </p>
        </div>
      </div>
    </footer>
  )
}

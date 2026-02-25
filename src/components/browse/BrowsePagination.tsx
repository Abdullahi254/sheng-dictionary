import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface BrowsePaginationProps {
  currentPage: number
  totalPages: number
  baseParams: Record<string, string>
}

function buildUrl(baseParams: Record<string, string>, page: number) {
  const params = new URLSearchParams(baseParams)
  if (page === 1) {
    params.delete('page')
  } else {
    params.set('page', String(page))
  }
  const qs = params.toString()
  return `/browse${qs ? `?${qs}` : ''}`
}

function getPageNumbers(currentPage: number, totalPages: number): (number | '…')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const window = new Set<number>([1, totalPages])
  for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
    window.add(i)
  }

  const sorted = Array.from(window).sort((a, b) => a - b)
  const pages: (number | '…')[] = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) pages.push('…')
    pages.push(sorted[i])
  }
  return pages
}

export function BrowsePagination({ currentPage, totalPages, baseParams }: BrowsePaginationProps) {
  if (totalPages <= 1) return null

  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages
  const pages = getPageNumbers(currentPage, totalPages)

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5 pt-16 pb-4">
      {/* Prev */}
      {hasPrev ? (
        <Link
          href={buildUrl(baseParams, currentPage - 1)}
          className="flex items-center gap-1.5 px-4 py-2 font-mono text-[11px] tracking-wider uppercase rounded-lg border border-white/10 text-muted-foreground/80 hover:border-white/20 hover:text-foreground/80 transition-all"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Prev
        </Link>
      ) : (
        <span className="flex items-center gap-1.5 px-4 py-2 font-mono text-[11px] tracking-wider uppercase rounded-lg border border-white/5 text-muted-foreground/80 opacity-30 cursor-not-allowed">
          <ChevronLeft className="w-3.5 h-3.5" />
          Prev
        </span>
      )}

      {/* Page numbers */}
      <div className="flex items-center gap-1 mx-1">
        {pages.map((p, i) =>
          p === '…' ? (
            <span
              key={`ellipsis-${i}`}
              className="w-9 h-9 flex items-center justify-center font-mono text-[11px] text-muted-foreground/80"
            >
              …
            </span>
          ) : (
            <Link
              key={p}
              href={buildUrl(baseParams, p)}
              aria-current={p === currentPage ? 'page' : undefined}
              className={`
                w-9 h-9 flex items-center justify-center font-mono text-[11px] rounded-lg transition-all
                ${p === currentPage
                  ? 'bg-[#c8f135] text-black font-bold'
                  : 'text-muted-foreground/80 hover:text-foreground/80 hover:bg-white/5'
                }
              `}
            >
              {p}
            </Link>
          ),
        )}
      </div>

      {/* Next */}
      {hasNext ? (
        <Link
          href={buildUrl(baseParams, currentPage + 1)}
          className="flex items-center gap-1.5 px-4 py-2 font-mono text-[11px] tracking-wider uppercase rounded-lg border border-white/10 text-muted-foreground/80 hover:border-white/20 hover:text-foreground/80 transition-all"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      ) : (
        <span className="flex items-center gap-1.5 px-4 py-2 font-mono text-[11px] tracking-wider uppercase rounded-lg border border-white/5 text-muted-foreground/80 opacity-30 cursor-not-allowed">
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      )}
    </nav>
  )
}

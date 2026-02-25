'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      router.push(`/browse?q=${encodeURIComponent(trimmed)}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto group">
      <div className="relative flex items-center">
        <Search className="absolute left-5 w-5 h-5 text-muted-foreground/80 pointer-events-none z-10" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. panda, msee, sawa..."
          autoComplete="off"
          spellCheck={false}
          className="
            w-full h-16 pl-14 pr-36
            bg-white/[0.05] border border-white/10
            rounded-xl text-base text-foreground
            placeholder:text-muted-foreground/60
            outline-none font-body
            transition-all duration-300
            focus:border-[#c8f135]/40 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#c8f135]/10
          "
        />
        <button
          type="submit"
          className="
            absolute right-2 h-12 px-5
            bg-[#c8f135] text-black
            font-display font-bold text-sm uppercase tracking-wider
            rounded-lg
            hover:bg-[#d4f545] active:scale-95
            transition-all duration-150
            disabled:opacity-50
          "
          disabled={!query.trim()}
        >
          Search
        </button>
      </div>
    </form>
  )
}

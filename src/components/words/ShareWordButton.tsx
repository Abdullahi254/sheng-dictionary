'use client'

import { useState } from 'react'
import { Share2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { generateWordImage } from '@/lib/generateWordImage'
import type { IWord } from '@/types'

interface ShareWordButtonProps {
  word: IWord
}

export function ShareWordButton({ word }: ShareWordButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleShare = async () => {
    setLoading(true)
    try {
      const blob = await generateWordImage(word)
      const file = new File([blob], `${word.slug}-sheng-dictionary.png`, { type: 'image/png' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        // Mobile: open the native share sheet (WhatsApp, IG Stories, X, …)
        await navigator.share({
          title: `${word.word} — Sheng Dictionary`,
          text: `Learn what "${word.word}" means in Sheng 🔥`,
          url: `https://shengdictionary.co.ke/word/${word.slug}`,
          files: [file],
        })
      } else {
        // Desktop fallback: auto-download the PNG
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${word.slug}-sheng-dictionary.png`
        a.click()
        URL.revokeObjectURL(url)
      }

      toast('Image ready to share! 🔥')
    } catch (err) {
      // AbortError fires when the user dismisses the native share sheet — not an error
      if (err instanceof Error && err.name !== 'AbortError') {
        toast.error('Could not generate image. Try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleShare}
      disabled={loading}
      className="
        bg-[#1a1a1a] border border-[#2a2a2a] text-white
        hover:border-[#39FF14] hover:text-[#39FF14] hover:bg-[#1a1a1a]
        transition-all duration-200
        disabled:opacity-50
      "
    >
      {loading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Share2 />
      )}
      {loading ? 'Generating...' : 'Share Word'}
    </Button>
  )
}

import type { IWord } from '@/types'

// ─── Internal helper ──────────────────────────────────────────────────────────
// Breaks `text` into wrapped lines, draws them, and returns the y-coordinate
// that would be the start of the next line (i.e. lastLineY + lineHeight).
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
): number {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = testLine
    }
  }
  if (line) lines.push(line)

  // Enforce max lines — truncate last line with ellipsis if needed
  const finalLines = lines.slice(0, maxLines)
  if (lines.length > maxLines) {
    let lastLine = finalLines[maxLines - 1]
    while (ctx.measureText(`${lastLine}…`).width > maxWidth && lastLine.length > 0) {
      lastLine = lastLine.slice(0, -1).trimEnd()
    }
    finalLines[maxLines - 1] = `${lastLine}…`
  }

  let currentY = y
  for (const l of finalLines) {
    ctx.fillText(l, x, currentY)
    currentY += lineHeight
  }

  // Returns the y position after the last drawn line
  return currentY
}

// ─── Public API ───────────────────────────────────────────────────────────────
// Generates a 1080×1080 PNG card for `word` entirely in-memory (no DOM append).
// Falls back to Georgia if Playfair Display fails to load.
export async function generateWordImage(word: IWord): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1080

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context not available')

  // ── Load display font ──────────────────────────────────────────────────────
  // Always use the full stack so the canvas falls back naturally to Georgia
  // if the FontFace fails to load.
  const DISPLAY_FONT = 'PlayfairDisplay, Georgia, serif'

  try {
    const font = new FontFace(
      'PlayfairDisplay',
      'url(https://fonts.gstatic.com/s/playfairdisplay/v37/nuFiD-vYSZviVYUb_rj3ij__anPXDTnCjmHKM4nYO7KN_pqQJ8Q.woff2)',
    )
    await font.load()
    document.fonts.add(font)
  } catch {
    // Silent fallback — Georgia takes over from the font stack automatically
  }

  // ── Layer 1: Background gradient ───────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, 0, 1080)
  bg.addColorStop(0, '#0a0a0a')
  bg.addColorStop(1, '#1c1c1c')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 1080, 1080)

  // ── Layer 2: Noise texture ─────────────────────────────────────────────────
  for (let i = 0; i < 18000; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.025})`
    ctx.fillRect(Math.random() * 1080, Math.random() * 1080, 1, 1)
  }

  // ── Layer 3: Watermark — drawn BEFORE main content ────────────────────────
  ctx.save()
  ctx.translate(540, 540)
  ctx.rotate((15 * Math.PI) / 180)
  ctx.translate(-540, -540)
  ctx.font = `200px ${DISPLAY_FONT}`
  ctx.fillStyle = 'rgba(255,255,255,0.04)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(word.word, 540, 540)
  ctx.restore()

  // ── Layer 4: Word — main headline ──────────────────────────────────────────
  let wordFontSize = 140
  ctx.font = `bold ${wordFontSize}px ${DISPLAY_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Scale down long words so they never overflow 900px
  if (word.word.length > 10) {
    while (ctx.measureText(word.word).width > 900 && wordFontSize > 60) {
      wordFontSize -= 4
      ctx.font = `bold ${wordFontSize}px ${DISPLAY_FONT}`
    }
  }

  const wordY = 380
  ctx.fillStyle = '#f0f0f0'
  ctx.fillText(word.word, 540, wordY)

  // ── Layer 5: Accent rule line ──────────────────────────────────────────────
  // 60px below the bottom edge of the word text box
  const wordBottom = wordY + wordFontSize / 2
  const ruleY = wordBottom + 60
  ctx.fillStyle = '#39FF14'
  ctx.fillRect(480, ruleY, 120, 2) // 120px wide, centered at x=540

  // ── Layer 6: Part of speech label ─────────────────────────────────────────
  const posY = ruleY + 2 + 50 // 50px below the rule's bottom edge
  ctx.font = '500 28px Arial'
  ctx.fillStyle = '#39FF14'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(word.partOfSpeech.toUpperCase(), 540, posY)

  // ── Layer 7: Definition ────────────────────────────────────────────────────
  // 80px below the bottom edge of the pos label (28px font → half = 14px)
  const defStartY = posY + 14 + 80
  ctx.font = '36px Arial'
  ctx.fillStyle = '#e8e8e8'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  const firstMeaning = word.definitions[0]?.meaning ?? ''
  const finalDefY = wrapText(ctx, firstMeaning, 540, defStartY, 820, 50, 3)

  // ── Layer 8: Example sentence ──────────────────────────────────────────────
  const firstExample = word.definitions[0]?.example ?? ''
  if (firstExample) {
    const startsWithQuote =
      firstExample.startsWith('\u201C') || firstExample.startsWith('"')
    const exampleText = startsWithQuote ? firstExample : `\u201C${firstExample}`

    ctx.font = 'italic 28px Arial'
    ctx.fillStyle = '#777777'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    // 30px below the last definition line
    wrapText(ctx, exampleText, 540, finalDefY + 30, 780, 40, 2)
  }

  // ── Layer 9: Bottom branding bar ───────────────────────────────────────────
  // Thin rule at y=960
  ctx.fillStyle = '#2a2a2a'
  ctx.fillRect(0, 960, 1080, 1)

  ctx.textBaseline = 'middle'

  ctx.font = '500 24px Arial'
  ctx.fillStyle = '#39FF14'
  ctx.textAlign = 'left'
  ctx.fillText('shengdictionary.co.ke', 80, 1020)

  ctx.font = 'bold 24px Arial'
  ctx.fillStyle = '#39FF14'
  ctx.textAlign = 'right'
  ctx.fillText('Sheng Dictionary', 1000, 1020)

  // ── Return canvas as PNG Blob ──────────────────────────────────────────────
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('canvas.toBlob returned null'))
      },
      'image/png',
    )
  })
}

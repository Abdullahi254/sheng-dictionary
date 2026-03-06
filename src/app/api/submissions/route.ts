import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import slugify from 'slugify'

import connectToDatabase from '@/lib/mongodb'
import Submission from '@/models/Submission'
import type { PartOfSpeech } from '@/types'

const VALID_POS = new Set<string>(['noun', 'verb', 'adjective', 'expression', 'adverb'])

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>

    const word = typeof body.word === 'string' ? body.word.trim() : ''
    const definition = typeof body.definition === 'string' ? body.definition.trim() : ''
    const example = typeof body.example === 'string' ? body.example.trim() : ''
    const partOfSpeech = typeof body.partOfSpeech === 'string' ? body.partOfSpeech : ''
    const region = typeof body.region === 'string' && body.region.trim() ? body.region.trim() : 'Nationwide'
    const submittedBy = typeof body.submittedBy === 'string' && body.submittedBy.trim()
      ? body.submittedBy.trim()
      : 'anonymous'
    const tags = Array.isArray(body.tags)
      ? (body.tags as unknown[]).filter((t): t is string => typeof t === 'string' && t.trim().length > 0).map((t) => t.trim().toLowerCase())
      : []

    // ── Validate ──────────────────────────────────────────────
    if (!word) {
      return NextResponse.json({ success: false, error: 'Word is required' }, { status: 400 })
    }
    if (!definition) {
      return NextResponse.json({ success: false, error: 'Definition is required' }, { status: 400 })
    }
    if (!VALID_POS.has(partOfSpeech)) {
      return NextResponse.json({ success: false, error: 'Valid part of speech is required' }, { status: 400 })
    }

    // ── Slug ──────────────────────────────────────────────────
    const slug = slugify(word, { lower: true, strict: true, trim: true })

    await connectToDatabase()

    // ── Save to submissions (never words) ─────────────────────
    await Submission.create({
      word: word.toLowerCase(),
      slug,
      definitions: [
        {
          meaning: definition,
          example,
          addedBy: 'community',
        },
      ],
      partOfSpeech: partOfSpeech as PartOfSpeech,
      region,
      status: 'pending',
      viewCount: 0,
      isFeatured: false,
      tags,
      submittedBy,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/submissions]', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

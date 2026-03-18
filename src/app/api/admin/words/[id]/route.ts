import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import slugify from 'slugify'

import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/mongodb'
import Word from '@/models/Word'
import type { PartOfSpeech } from '@/types'

const VALID_POS = new Set<PartOfSpeech>(['noun', 'verb', 'adjective', 'expression', 'adverb'])

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = (await req.json()) as {
      word?: string
      partOfSpeech?: string
      meaning?: string
      example?: string
      origin?: string
      tags?: string[]
      relatedWords?: string[]
      region?: string
    }

    await connectToDatabase()

    // Build $set object incrementally
    const setFields: Record<string, unknown> = {}

    if (body.word !== undefined) {
      const trimmed = body.word.trim().toLowerCase()
      setFields['word'] = trimmed
      setFields['slug'] = slugify(trimmed, { lower: true, strict: true })
    }

    if (body.partOfSpeech !== undefined) {
      if (!VALID_POS.has(body.partOfSpeech as PartOfSpeech)) {
        return NextResponse.json({ success: false, error: 'Invalid partOfSpeech' }, { status: 400 })
      }
      setFields['partOfSpeech'] = body.partOfSpeech
    }

    if (body.meaning !== undefined) {
      setFields['definitions.0.meaning'] = body.meaning.trim()
    }

    if (body.example !== undefined) {
      setFields['definitions.0.example'] = body.example.trim()
    }

    if (body.origin !== undefined) {
      setFields['origin'] = body.origin.trim()
    }

    if (body.tags !== undefined) {
      setFields['tags'] = body.tags
    }

    if (body.relatedWords !== undefined) {
      setFields['relatedWords'] = body.relatedWords
    }

    if (body.region !== undefined) {
      setFields['region'] = body.region.trim()
    }

    const updated = await Word.findByIdAndUpdate(id, { $set: setFields }, { new: true })

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Word not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/words/PATCH]', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

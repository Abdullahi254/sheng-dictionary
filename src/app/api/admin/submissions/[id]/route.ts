import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import slugify from 'slugify'

import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/mongodb'
import Submission from '@/models/Submission'
import type { PartOfSpeech } from '@/types'

type Context = { params: Promise<{ id: string }> }

const VALID_POS = new Set<string>(['noun', 'verb', 'adjective', 'expression', 'adverb'])

export async function PATCH(req: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = (await req.json()) as Record<string, unknown>

    const updates: Record<string, unknown> = {}

    if (typeof body.word === 'string' && body.word.trim()) {
      const word = body.word.trim().toLowerCase()
      updates.word = word
      updates.slug = slugify(word, { lower: true, strict: true, trim: true })
    }

    if (typeof body.partOfSpeech === 'string' && VALID_POS.has(body.partOfSpeech)) {
      updates.partOfSpeech = body.partOfSpeech as PartOfSpeech
    }

    if (typeof body.meaning === 'string' && body.meaning.trim()) {
      updates['definitions.0.meaning'] = body.meaning.trim()
    }

    if (typeof body.example === 'string') {
      updates['definitions.0.example'] = body.example.trim()
    }

    if (typeof body.origin === 'string') {
      updates.origin = body.origin.trim() || undefined
    }

    if (Array.isArray(body.tags)) {
      updates.tags = (body.tags as unknown[])
        .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
        .map((t) => t.trim().toLowerCase())
    }

    if (Array.isArray(body.relatedWords)) {
      updates.relatedWords = (body.relatedWords as unknown[])
        .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
        .map((s) => s.trim())
    }

    if (typeof body.region === 'string' && body.region.trim()) {
      updates.region = body.region.trim()
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 })
    }

    await connectToDatabase()

    const submission = await Submission.findOneAndUpdate(
      { _id: id, status: 'pending' },
      { $set: updates },
      { new: true },
    )

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found or already processed' },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PATCH /api/admin/submissions/:id]', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

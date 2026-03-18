import { NextRequest, NextResponse } from 'next/server'

import connectToDatabase from '@/lib/mongodb'
import Word from '@/models/Word'
import Flag from '@/models/Flag'
import type { FlagReason } from '@/types'

const VALID_REASONS: FlagReason[] = ['not_sheng', 'mistranslation', 'offensive', 'outdated', 'other']

type Params = { params: Promise<{ slug: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params
    const body = (await req.json()) as { reason?: string; suggestion?: string; reportedBy?: string }

    // Validate reason
    if (!body.reason || !VALID_REASONS.includes(body.reason as FlagReason)) {
      return NextResponse.json({ success: false, error: 'Invalid reason' }, { status: 400 })
    }

    await connectToDatabase()

    const word = await Word.findOne({ slug, status: 'approved' }).lean()
    if (!word) {
      return NextResponse.json({ success: false, error: 'Word not found' }, { status: 404 })
    }

    await Flag.create({
      wordId: word._id,
      wordSlug: word.slug,
      wordName: word.word,
      reason: body.reason as FlagReason,
      suggestion: body.suggestion?.trim() ?? '',
      reportedBy: body.reportedBy?.trim() || 'anonymous',
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[flag/POST]', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

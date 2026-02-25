import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/mongodb'
import Submission from '@/models/Submission'
import Word from '@/models/Word'

type Context = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Context) {
  // ── Auth check ─────────────────────────────────────────────────
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    await connectToDatabase()

    // ── Fetch the submission ────────────────────────────────────
    const submission = await Submission.findById(id)
    if (!submission) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 })
    }
    if (submission.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: `Submission is already ${submission.status}` },
        { status: 409 },
      )
    }

    // ── Slug conflict check ────────────────────────────────────
    const existing = await Word.findOne({ slug: submission.slug })
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `A word with slug "${submission.slug}" already exists. Reject this duplicate or edit the slug before approving.`,
        },
        { status: 409 },
      )
    }

    // ── Create the approved Word ────────────────────────────────
    // Mark each definition as added by the approving admin.
    const definitions = submission.definitions.map((def) => ({
      meaning: def.meaning,
      example: def.example,
      addedBy: session.user?.email ?? 'admin',
    }))

    await Word.create({
      word: submission.word,
      slug: submission.slug,
      definitions,
      partOfSpeech: submission.partOfSpeech,
      origin: submission.origin,
      relatedWords: submission.relatedWords,
      region: submission.region,
      status: 'approved',
      viewCount: 0,
      isFeatured: false,
      tags: submission.tags,
      submittedBy: submission.submittedBy,
    })

    // ── Mark the submission as approved (keep for audit trail) ─
    submission.status = 'approved'
    await submission.save()

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[approve submission]', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}

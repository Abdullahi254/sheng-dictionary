import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/mongodb'
import Submission from '@/models/Submission'

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

    submission.status = 'rejected'
    await submission.save()

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[reject submission]', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}

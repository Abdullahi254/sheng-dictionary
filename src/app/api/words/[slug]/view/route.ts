import { type NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Word from '@/models/Word'
import type { ApiResponse } from '@/types'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  try {
    await connectToDatabase()

    await Word.findOneAndUpdate(
      { slug, status: 'approved' },
      { $inc: { viewCount: 1 } },
    )

    return NextResponse.json<ApiResponse<null>>({ success: true, data: null })
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to track view' },
      { status: 500 },
    )
  }
}

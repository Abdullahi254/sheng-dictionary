import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Word from '@/models/Word'

export const revalidate = 3600

export async function GET() {
  try {
    await connectToDatabase()

    const result = await Word.aggregate<{ tag: string }>([
      { $match: { status: 'approved' } },
      { $unwind: '$tags' },
      { $match: { tags: { $regex: /\S/ } } }, // filter blank/whitespace tags
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 30 },
      { $project: { _id: 0, tag: '$_id' } },
    ])

    const tags = result.map((r) => r.tag.trim()).filter((t) => t.length > 0)

    return NextResponse.json({ success: true, data: tags })
  } catch (err) {
    console.error('[GET /api/tags]', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch tags' }, { status: 500 })
  }
}

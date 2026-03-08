import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Word from '@/models/Word'

export const revalidate = 3600

export async function GET() {
  try {
    await connectToDatabase()

    const words = await Word.find({ status: 'approved' }, { word: 1, slug: 1, _id: 0 })
      .sort({ word: 1 })
      .lean()

    return NextResponse.json({ success: true, data: words })
  } catch (err) {
    console.error('[GET /api/words]', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch words' }, { status: 500 })
  }
}

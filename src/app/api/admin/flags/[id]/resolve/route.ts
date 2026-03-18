import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/mongodb'
import Flag from '@/models/Flag'

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await connectToDatabase()

    const flag = await Flag.findOne({ _id: id, status: 'pending' })
    if (!flag) {
      return NextResponse.json({ success: false, error: 'Flag not found or already actioned' }, { status: 404 })
    }

    flag.status = 'resolved'
    await flag.save()

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/flags/resolve/POST]', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

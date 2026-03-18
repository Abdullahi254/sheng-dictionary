import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/mongodb'
import Flag from '@/models/Flag'
import Word from '@/models/Word'
import type { IFlag, IWord } from '@/types'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const flagDocs = await Flag.find({ status: 'pending' }).sort({ createdAt: -1 }).lean()
    const flags = JSON.parse(JSON.stringify(flagDocs)) as IFlag[]

    const results = await Promise.all(
      flags.map(async (flag) => {
        const wordDoc = await Word.findById(flag.wordId).lean()
        const word = wordDoc ? (JSON.parse(JSON.stringify(wordDoc)) as IWord) : null
        return { flag, word }
      })
    )

    return NextResponse.json({ success: true, data: results })
  } catch (err) {
    console.error('[admin/flags/GET]', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

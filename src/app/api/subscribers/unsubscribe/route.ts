import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import connectToDatabase from '@/lib/mongodb'
import Subscriber from '@/models/Subscriber'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 })
  }

  try {
    await connectToDatabase()

    const subscriber = await Subscriber.findOne({ unsubscribeToken: token })

    if (!subscriber) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 404 })
    }

    subscriber.isActive = false
    await subscriber.save()

    // Redirect to a friendly confirmation page
    return NextResponse.redirect(new URL('/unsubscribed', req.url))
  } catch (err) {
    console.error('[GET /api/subscribers/unsubscribe]', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

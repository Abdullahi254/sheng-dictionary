import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import connectToDatabase from '@/lib/mongodb'
import { getCurrentWeekStart } from '@/lib/utils'
import { resend } from '@/lib/resend'
import Word from '@/models/Word'
import WordOfTheWeek from '@/models/WordOfTheWeek'
import Subscriber from '@/models/Subscriber'
import type { IWordDocument } from '@/models/Word'

export async function GET(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectToDatabase()

    // ── Current week start (Monday) ────────────────────────────────
    const weekStart = getCurrentWeekStart()

    // Idempotent: skip if already set for this week
    const existing = await WordOfTheWeek.findOne({ weekStart })
    if (existing) {
      return NextResponse.json({ success: true, message: 'Already set for this week' })
    }

    // ── Pick a word ───────────────────────────────────────────────
    // Exclude words used in the last 52 weeks (~364 days)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 364)
    const cutoffStr = cutoff.toISOString().slice(0, 10)

    const recentWordIds = await WordOfTheWeek.find({ weekStart: { $gte: cutoffStr } }).distinct('word')

    const candidate = await Word.aggregate<IWordDocument>([
      {
        $match: {
          status: 'approved',
          isFeatured: true,
          _id: { $nin: recentWordIds },
        },
      },
      { $sample: { size: 1 } },
    ])

    if (!candidate.length) {
      return NextResponse.json(
        { success: false, error: 'No eligible featured words found' },
        { status: 404 },
      )
    }

    const word = candidate[0]

    // ── Save word of the week ─────────────────────────────────────
    await WordOfTheWeek.create({ word: word._id, weekStart })

    // ── Send emails ───────────────────────────────────────────────
    const subscribers = await Subscriber.find({ isActive: true }).select('email unsubscribeToken').lean()

    if (subscribers.length > 0) {
      const appUrl = process.env.NEXTAUTH_URL ?? 'https://shengdictionary.co.ke'
      const fromAddress = process.env.EMAIL_FROM ?? 'noreply@contact.shengdictionary.co.ke'
      const firstDefinition = word.definitions[0]?.meaning ?? ''

      // Resend batch accepts up to 100 emails per call; chunk if needed
      const BATCH_SIZE = 100
      for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
        const chunk = subscribers.slice(i, i + BATCH_SIZE)

        await resend.batch.send(
          chunk.map((sub) => ({
            from: `Sheng Dictionary <${fromAddress}>`,
            to: sub.email,
            subject: `This Week's Sheng Word: ${word.word} 🔥`,
            html: buildWotwEmail({
              word: word.word,
              partOfSpeech: word.partOfSpeech,
              definition: firstDefinition,
              example: word.definitions[0]?.example ?? '',
              wordUrl: `${appUrl}/word/${word.slug}`,
              unsubscribeUrl: `${appUrl}/api/subscribers/unsubscribe?token=${sub.unsubscribeToken}`,
            }),
          })),
        )
      }
    }

    return NextResponse.json({
      success: true,
      word: word.word,
      weekStart,
      emailsSent: subscribers.length,
    })
  } catch (err) {
    console.error('[cron/word-of-the-week]', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// ─── Email template ──────────────────────────────────────────────────────────

interface WotwEmailProps {
  word: string
  partOfSpeech: string
  definition: string
  example: string
  wordUrl: string
  unsubscribeUrl: string
}

function buildWotwEmail({
  word,
  partOfSpeech,
  definition,
  example,
  wordUrl,
  unsubscribeUrl,
}: WotwEmailProps): string {
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>This Week's Sheng Word: ${word}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;">
  <div style="max-width:520px;margin:0 auto;padding:48px 32px;font-family:system-ui,-apple-system,sans-serif;">

    <!-- Header label -->
    <p style="margin:0 0 28px;color:#c8f135;font-size:10px;letter-spacing:0.5em;text-transform:uppercase;font-weight:700;">
      Sheng Dictionary · Word of the Week
    </p>

    <!-- Word -->
    <h1 style="margin:0 0 6px;color:#f0ede8;font-size:52px;font-weight:900;text-transform:uppercase;line-height:1;letter-spacing:-0.03em;">
      ${word}
    </h1>

    <!-- Part of speech -->
    <p style="margin:0 0 24px;color:#666;font-size:12px;font-style:italic;letter-spacing:0.05em;">
      ${cap(partOfSpeech)}
    </p>

    <!-- Divider -->
    <div style="height:2px;background:#c8f135;width:40px;margin-bottom:24px;"></div>

    <!-- Definition -->
    <p style="margin:0 0 20px;color:#ccc;font-size:16px;line-height:1.7;">
      ${definition}
    </p>

    ${example ? `
    <!-- Example -->
    <div style="border-left:3px solid #c8f135;padding:12px 16px;margin:0 0 32px;background:rgba(200,241,53,0.04);border-radius:0 8px 8px 0;">
      <p style="margin:0;color:#888;font-size:13px;line-height:1.6;font-style:italic;">&ldquo;${example}&rdquo;</p>
    </div>` : '<div style="margin-bottom:32px;"></div>'}

    <!-- CTA -->
    <a href="${wordUrl}"
      style="display:inline-block;background:#c8f135;color:#000;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;font-size:13px;padding:14px 28px;text-decoration:none;border-radius:10px;margin-bottom:40px;">
      See full entry →
    </a>

    <!-- Footer -->
    <p style="margin:0;color:#333;font-size:11px;line-height:1.8;border-top:1px solid #1a1a1a;padding-top:24px;">
      You're receiving this because you subscribed at shengdictionary.com.<br>
      <a href="${unsubscribeUrl}" style="color:#555;text-decoration:underline;">Unsubscribe</a>
    </p>

  </div>
</body>
</html>`
}

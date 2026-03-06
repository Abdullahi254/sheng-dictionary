import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import connectToDatabase from '@/lib/mongodb'
import { resend } from '@/lib/resend'
import Subscriber from '@/models/Subscriber'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Valid email is required' }, { status: 400 })
    }

    await connectToDatabase()

    const appUrl = process.env.NEXTAUTH_URL ?? 'https://shengdictionary.co.ke'
    const fromAddress = process.env.EMAIL_FROM ?? 'noreply@contact.shengdictionary.co.ke'

    // Re-activate if they previously unsubscribed
    const existing = await Subscriber.findOne({ email })
    if (existing) {
      if (existing.isActive) {
        return NextResponse.json({ success: false, error: 'Already subscribed' }, { status: 409 })
      }
      existing.isActive = true
      await existing.save()

      await resend.emails.send({
        from: `Sheng Dictionary <${fromAddress}>`,
        to: email,
        subject: 'Welcome back to Sheng Dictionary 🔥 — Word of the Week',
        html: buildWelcomeEmail({
          unsubscribeUrl: `${appUrl}/api/subscribers/unsubscribe?token=${existing.unsubscribeToken as string}`,
        }),
      })

      return NextResponse.json({ success: true })
    }

    const unsubscribeToken = crypto.randomUUID()
    await Subscriber.create({ email, unsubscribeToken })

    await resend.emails.send({
      from: `Sheng Dictionary <${fromAddress}>`,
      to: email,
      subject: 'Welcome to Sheng Dictionary 🔥 — Word of the Week',
      html: buildWelcomeEmail({
        unsubscribeUrl: `${appUrl}/api/subscribers/unsubscribe?token=${unsubscribeToken}`,
      }),
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/subscribers]', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// ─── Welcome email template ───────────────────────────────────────────────────

function buildWelcomeEmail({ unsubscribeUrl }: { unsubscribeUrl: string }): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Welcome to Sheng Dictionary</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;">
  <div style="max-width:520px;margin:0 auto;padding:48px 32px;font-family:system-ui,-apple-system,sans-serif;">

    <!-- Header label -->
    <p style="margin:0 0 28px;color:#c8f135;font-size:10px;letter-spacing:0.5em;text-transform:uppercase;font-weight:700;">
      Sheng Dictionary · Word of the Week
    </p>

    <!-- Headline -->
    <h1 style="margin:0 0 6px;color:#f0ede8;font-size:44px;font-weight:900;text-transform:uppercase;line-height:1;letter-spacing:-0.03em;">
      Sawa Sawa!
    </h1>

    <p style="margin:0 0 24px;color:#666;font-size:12px;font-style:italic;letter-spacing:0.05em;">
      You&apos;re officially in. 🔥
    </p>

    <!-- Divider -->
    <div style="height:2px;background:#c8f135;width:40px;margin-bottom:24px;"></div>

    <!-- Body -->
    <p style="margin:0 0 16px;color:#ccc;font-size:16px;line-height:1.7;">
      Every week you&apos;ll get a fresh Sheng word straight from the streets of Nairobi — straight to your inbox. No spam, just vibes.
    </p>
    <p style="margin:0 0 32px;color:#ccc;font-size:16px;line-height:1.7;">
      Expect your first word this week. Stay woke. 🇰🇪
    </p>

    <!-- CTA -->
    <a href="https://shengdictionary.co.ke"
      style="display:inline-block;background:#c8f135;color:#000;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;font-size:13px;padding:14px 28px;text-decoration:none;border-radius:10px;margin-bottom:40px;">
      Explore the dictionary →
    </a>

    <!-- Footer -->
    <p style="margin:0;color:#333;font-size:11px;line-height:1.8;border-top:1px solid #1a1a1a;padding-top:24px;">
      You&apos;re receiving this because you subscribed at shengdictionary.com.<br>
      <a href="${unsubscribeUrl}" style="color:#555;text-decoration:underline;">Unsubscribe</a>
    </p>

  </div>
</body>
</html>`
}

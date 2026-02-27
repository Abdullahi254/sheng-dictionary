import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { resend } from '@/lib/resend'

export async function POST(request: NextRequest) {
  // ── Verify webhook signature (svix) ──────────────────────────────────────
  const payload = await request.text()

  let event: { type: string; data: { email_id: string } }
  try {
    event = resend.webhooks.verify({
      payload,
      headers: {
        id: request.headers.get('svix-id') ?? '',
        timestamp: request.headers.get('svix-timestamp') ?? '',
        signature: request.headers.get('svix-signature') ?? '',
      },
      webhookSecret: process.env.RESEND_WEBHOOK_SECRET ?? '',
    }) as typeof event
  } catch {
    return new NextResponse('Invalid webhook signature', { status: 400 })
  }

  if (event.type !== 'email.received') {
    return NextResponse.json({ success: true })
  }

  const emailId = event.data?.email_id
  if (!emailId) {
    return NextResponse.json({ success: false, error: 'Missing email_id' }, { status: 400 })
  }

  try {
    // Fetch the full email body from Resend (payload only contains metadata)
    const { data: email, error: fetchError } = await resend.emails.receiving.get(emailId)

    if (fetchError || !email) {
      console.error('[inbound-email] Failed to fetch email body:', fetchError)
      return NextResponse.json({ success: false, error: 'Failed to fetch email' }, { status: 502 })
    }

    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail) {
      console.error('[inbound-email] ADMIN_EMAIL env var is not set')
      return NextResponse.json({ success: false, error: 'Admin email not configured' }, { status: 500 })
    }

    const fromAddress = process.env.EMAIL_FROM ?? 'noreply@shengdictionary.co.ke'
    const originalFrom = (email as { from?: string }).from ?? 'Unknown sender'
    const originalSubject = (email as { subject?: string }).subject ?? '(no subject)'
    const htmlBody = (email as { html?: string }).html ?? undefined
    const textBody = (email as { text?: string }).text ?? undefined

    await resend.emails.send({
      from: `Sheng Dictionary <${fromAddress}>`,
      to: adminEmail,
      replyTo: originalFrom,
      subject: `[Forwarded] ${originalSubject}`,
      html: buildForwardHtml({ originalFrom, originalSubject, html: htmlBody, text: textBody }),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[inbound-email]', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// ─── Forward email template ────────────────────────────────────────────────────

interface ForwardEmailProps {
  originalFrom: string
  originalSubject: string
  html?: string
  text?: string
}

function buildForwardHtml({ originalFrom, originalSubject, html, text }: ForwardEmailProps): string {
  // Prefer the original HTML; fall back to plain text wrapped in a <pre>
  const body = html
    ? html
    : `<pre style="margin:0;font-family:system-ui,-apple-system,sans-serif;font-size:14px;color:#ccc;white-space:pre-wrap;">${escapeHtml(text ?? '')}</pre>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(originalSubject)}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;">
  <div style="max-width:600px;margin:0 auto;padding:32px;font-family:system-ui,-apple-system,sans-serif;">

    <!-- Forwarded badge -->
    <p style="margin:0 0 20px;color:#c8f135;font-size:10px;letter-spacing:0.5em;text-transform:uppercase;font-weight:700;">
      Sheng Dictionary · Forwarded from privacy@contact.shengdictionary.co.ke
    </p>

    <!-- Metadata -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;border:1px solid #1e1e1e;border-radius:8px;overflow:hidden;">
      <tr>
        <td style="padding:10px 14px;background:#111;color:#555;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;width:80px;">From</td>
        <td style="padding:10px 14px;background:#111;color:#f0ede8;font-size:13px;">${escapeHtml(originalFrom)}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;background:#0d0d0d;color:#555;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;">Subject</td>
        <td style="padding:10px 14px;background:#0d0d0d;color:#f0ede8;font-size:13px;">${escapeHtml(originalSubject)}</td>
      </tr>
    </table>

    <!-- Divider -->
    <div style="height:2px;background:#c8f135;width:40px;margin-bottom:24px;"></div>

    <!-- Original email body -->
    <div style="color:#ccc;font-size:14px;line-height:1.7;">
      ${body}
    </div>

    <!-- Footer -->
    <p style="margin:32px 0 0;color:#333;font-size:11px;border-top:1px solid #1a1a1a;padding-top:20px;">
      This email was automatically forwarded to you as the Sheng Dictionary admin.
    </p>

  </div>
</body>
</html>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

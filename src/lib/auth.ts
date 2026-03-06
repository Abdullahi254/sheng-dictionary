import { MongoDBAdapter } from '@auth/mongodb-adapter'
import EmailProvider from 'next-auth/providers/email'
import { Resend } from 'resend'
import type { NextAuthOptions } from 'next-auth'
import type { Adapter } from 'next-auth/adapters'
import clientPromise from './mongodb-client'

const resend = new Resend(process.env.RESEND_API_KEY)

// The only email address allowed to sign in
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? ''

export const authOptions: NextAuthOptions = {
  // @auth/mongodb-adapter v3 ships Auth.js v5 types that don't structurally
  // match the mongodb MongoClient declaration used here, even though they are
  // the same at runtime. The `as any` cast on clientPromise silences the false
  // type error; the `as Adapter` cast bridges the v5→v4 Adapter interface gap.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: MongoDBAdapter(clientPromise as any) as Adapter,

  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM ?? 'noreply@contact.shengdictionary.co.ke',

      // Custom send function routes through Resend instead of nodemailer.
      // Non-admin emails are silently ignored so we don't leak whether an
      // address is registered (and to avoid burning Resend quota).
      sendVerificationRequest: async ({ identifier: email, url }) => {
        if (email !== ADMIN_EMAIL) return

        // Wrap the NextAuth callback URL in an intermediate confirmation page.
        // This prevents Google Safe Browsing pre-fetches from consuming the
        // one-time token before the admin actually clicks the button.
        const confirmUrl = url.replace(
          '/api/auth/callback/email',
          '/admin/verify'
        )

        const { error } = await resend.emails.send({
          from: `Sheng Dictionary <${process.env.EMAIL_FROM ?? 'noreply@contact.shengdictionary.co.ke'}>`,
          to: email,
          subject: 'Sign in to Sheng Dictionary Admin',
          html: buildMagicLinkEmail(confirmUrl),
        })

        if (error) {
          throw new Error(`[auth] Resend error: ${error.message}`)
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    // Final gate: reject sign-in if the verified email is not the admin.
    async signIn({ user }) {
      return user.email === ADMIN_EMAIL
    },
    // Populate the session object from the JWT token so getServerSession
    // returns a full session regardless of which page is being rendered.
    async jwt({ token, user }) {
      if (user) token.email = user.email
      return token
    },
    async session({ session, token }) {
      if (token.email) session.user = { ...session.user, email: token.email as string }
      return session
    },
  },

  pages: {
    signIn: '/admin/login',
    verifyRequest: '/admin/login',
    error: '/admin/login',
  },
}

// ─── Email HTML ───────────────────────────────────────────────────────────────
function buildMagicLinkEmail(url: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;">
  <div style="max-width:480px;margin:0 auto;padding:48px 32px;font-family:system-ui,-apple-system,sans-serif;">

    <p style="margin:0 0 32px;color:#c8f135;font-size:11px;letter-spacing:0.5em;text-transform:uppercase;font-weight:600;">
      Sheng Dictionary · Admin
    </p>

    <h1 style="margin:0 0 12px;color:#f0ede8;font-size:28px;font-weight:900;text-transform:uppercase;line-height:1.1;letter-spacing:-0.02em;">
      Your sign-in link
    </h1>

    <p style="margin:0 0 32px;color:#888;font-size:14px;line-height:1.7;">
      Click the button below to access the admin dashboard.<br>
      This link expires in <strong style="color:#aaa;">24 hours</strong> and can only be used once.
    </p>

    <a href="${url}"
      style="display:inline-block;background:#c8f135;color:#000;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;font-size:13px;padding:14px 28px;text-decoration:none;border-radius:10px;">
      Sign in to Admin →
    </a>

    <p style="margin:40px 0 0;color:#444;font-size:12px;line-height:1.7;">
      If you didn't request this link, you can safely ignore this email.
    </p>
  </div>
</body>
</html>`
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy | Sheng Dictionary',
  description:
    'Learn how Sheng Dictionary collects, uses, and protects your personal information. Read our privacy policy for details on data storage, cookies, and email subscriptions.',
  alternates: { canonical: '/privacy-policy' },
}

// ─── Section heading component ────────────────────────────────────────────────
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display font-black text-xl uppercase tracking-wide text-[#c8f135] mt-12 mb-4">
      {children}
    </h2>
  )
}

// ─── Body paragraph component ─────────────────────────────────────────────────
function Para({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground leading-relaxed mb-4 font-body text-sm sm:text-base">
      {children}
    </p>
  )
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        {/* Page header */}
        <div className="mb-10 border-b border-white/5 pb-10">
          <p className="font-mono text-[10px] tracking-[0.5em] uppercase text-[#c8f135] mb-4">
            Legal
          </p>
          <h1 className="font-display font-black text-4xl sm:text-5xl uppercase leading-none tracking-tight text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground/70 text-sm font-mono">
            Last updated: February 27, 2026
          </p>
        </div>

        {/* Introduction */}
        <SectionHeading>Introduction</SectionHeading>
        <Para>
          Sheng Dictionary (<strong className="text-foreground/90">shengdictionary.co.ke</strong>) is
          a community-driven dictionary for Sheng — Nairobi&apos;s urban street language. This
          Privacy Policy explains what information we collect, how we use it, and your rights
          regarding your data when you visit or interact with our website.
        </Para>
        <Para>
          By using Sheng Dictionary, you agree to the practices described in this policy. If you
          have questions, contact us at{' '}
          <a
            href="mailto:privacy@contact.shengdictionary.co.ke"
            className="text-[#c8f135] hover:underline"
          >
            privacy@contact.shengdictionary.co.ke
          </a>
          .
        </Para>

        {/* Information We Collect */}
        <SectionHeading>Information We Collect</SectionHeading>
        <Para>We collect the following types of information:</Para>
        <ul className="text-muted-foreground text-sm sm:text-base font-body leading-relaxed mb-4 space-y-3 list-none pl-0">
          <li className="flex gap-3">
            <span className="text-[#c8f135] shrink-0 mt-1">—</span>
            <span>
              <strong className="text-foreground/90">Email addresses</strong> — collected only when
              you voluntarily subscribe to our Word of the Week newsletter.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#c8f135] shrink-0 mt-1">—</span>
            <span>
              <strong className="text-foreground/90">Usage data</strong> — anonymised data about
              how visitors interact with the site (pages visited, time on site, search queries)
              collected via Google Analytics.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#c8f135] shrink-0 mt-1">—</span>
            <span>
              <strong className="text-foreground/90">Cookies</strong> — small files placed on your
              device by Google Analytics and Google AdSense to enable tracking and personalised
              advertising.
            </span>
          </li>
        </ul>
        <Para>
          We do not collect names, phone numbers, physical addresses, or payment information. Word
          submissions may optionally include a display name, but this is not required.
        </Para>

        {/* How We Use Your Information */}
        <SectionHeading>How We Use Your Information</SectionHeading>
        <Para>We use the information we collect for the following purposes:</Para>
        <ul className="text-muted-foreground text-sm sm:text-base font-body leading-relaxed mb-4 space-y-3 list-none pl-0">
          <li className="flex gap-3">
            <span className="text-[#c8f135] shrink-0 mt-1">—</span>
            <span>
              To send the <strong className="text-foreground/90">Word of the Week</strong> newsletter
              to subscribers who have opted in.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#c8f135] shrink-0 mt-1">—</span>
            <span>
              To <strong className="text-foreground/90">understand and improve</strong> the site
              through anonymised analytics — what words are popular, how people search, and where
              traffic comes from.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#c8f135] shrink-0 mt-1">—</span>
            <span>
              To <strong className="text-foreground/90">serve relevant advertisements</strong> via
              Google AdSense to keep the site free for everyone.
            </span>
          </li>
        </ul>

        {/* Google AdSense & Cookies */}
        <SectionHeading>Google AdSense &amp; Cookies</SectionHeading>
        <Para>
          Sheng Dictionary uses Google AdSense to display advertisements. Google AdSense uses
          cookies to serve ads based on your prior visits to this and other websites. These
          cookies allow Google and its partners to serve ads based on your interests.
        </Para>
        <Para>
          You may opt out of personalised advertising by visiting{' '}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#c8f135] hover:underline"
          >
            Google&apos;s Ads Settings
          </a>
          . For more information on how Google uses data, see Google&apos;s Privacy Policy at{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#c8f135] hover:underline"
          >
            policies.google.com/privacy
          </a>
          .
        </Para>

        {/* Google Analytics */}
        <SectionHeading>Google Analytics</SectionHeading>
        <Para>
          We use Google Analytics to collect anonymous information about how visitors use Sheng
          Dictionary. Google Analytics uses cookies to track interactions and generates statistical
          reports about website activity. All data is anonymised — we do not receive personally
          identifiable information from Google Analytics.
        </Para>
        <Para>
          You can opt out of Google Analytics tracking by installing the{' '}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#c8f135] hover:underline"
          >
            Google Analytics Opt-out Browser Add-on
          </a>
          .
        </Para>

        {/* Email Subscriptions */}
        <SectionHeading>Email Subscriptions</SectionHeading>
        <Para>
          If you subscribe to the Word of the Week newsletter, we store your email address
          securely to send you one email per week featuring a Sheng word. We will never use your
          email for any other purpose, and we will never share or sell it to third parties.
        </Para>
        <Para>
          You can unsubscribe at any time by clicking the{' '}
          <strong className="text-foreground/90">unsubscribe link</strong> included in every email
          we send. After unsubscribing you will receive no further emails from us.
        </Para>

        {/* Data Storage */}
        <SectionHeading>Data Storage</SectionHeading>
        <Para>
          All data collected by Sheng Dictionary — including email addresses and word submissions
          — is stored securely in{' '}
          <strong className="text-foreground/90">MongoDB Atlas</strong>, a cloud database service
          with encryption at rest and in transit.
        </Para>
        <Para>
          We do <strong className="text-foreground/90">not</strong> sell, trade, rent, or share
          your personal data with third parties, except as required by law or as described in
          this policy (e.g. Google Analytics, Google AdSense).
        </Para>

        {/* Third Party Links */}
        <SectionHeading>Third-Party Links</SectionHeading>
        <Para>
          Sheng Dictionary may contain links to external websites that are not operated by us.
          If you click a third-party link, you will be directed to that site. We strongly advise
          you to review the Privacy Policy of every site you visit. We have no control over and
          assume no responsibility for the content, privacy policies, or practices of any
          third-party sites.
        </Para>

        {/* Children's Privacy */}
        <SectionHeading>Children&apos;s Privacy</SectionHeading>
        <Para>
          Sheng Dictionary is not directed at children under the age of 13. We do not knowingly
          collect personal information from children under 13. If you believe a child under 13
          has provided us with personal information, please contact us and we will delete it
          promptly.
        </Para>

        {/* Changes to This Policy */}
        <SectionHeading>Changes to This Policy</SectionHeading>
        <Para>
          We may update this Privacy Policy from time to time. Any changes will be posted on
          this page with an updated &quot;Last updated&quot; date at the top. We encourage you to
          review this policy periodically to stay informed about how we protect your information.
        </Para>

        {/* Contact */}
        <SectionHeading>Contact</SectionHeading>
        <Para>
          If you have any questions or concerns about this Privacy Policy or how your data is
          handled, please contact us at:
        </Para>
        <div className="rounded-xl border border-white/[0.07] bg-[#111111] px-6 py-5 mb-8">
          <p className="text-foreground/90 text-sm font-mono">
            <span className="text-[#c8f135]">Email:</span>{' '}
            <a
              href="mailto:privacy@contact.shengdictionary.co.ke"
              className="hover:underline"
            >
              privacy@contact.shengdictionary.co.ke
            </a>
          </p>
        </div>

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground/60 hover:text-muted-foreground font-mono text-xs uppercase tracking-widest transition-colors"
          >
            ← Back to Sheng Dictionary
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}

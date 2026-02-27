import type { Metadata } from 'next'
import { Barlow_Condensed, DM_Sans } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

// Display font — bold, condensed, matatu poster energy
const barlow = Barlow_Condensed({
  variable: '--font-barlow',
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
})

// Body font — clean but distinctive, not overused
const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sheng Dictionary — Nairobi\'s Street Language, Translated',
  description:
    'The definitive dictionary for Sheng — Nairobi\'s urban street language. Look up meanings, see usage examples, and discover the words Gen Z Kenyans actually use.',
  keywords: ['sheng', 'nairobi slang', 'kenyan slang', 'sheng dictionary', 'kenyan youth language'],
  openGraph: {
    title: 'Sheng Dictionary',
    description: 'The definitive dictionary for Sheng — Nairobi\'s street language, translated.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Force dark mode — this app lives in the night
    <html lang="en" className="dark">
      <head>
        {/* AdSense script in <head> so Google's crawler sees it in raw HTML */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5366695242791546"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${barlow.variable} ${dmSans.variable} font-body bg-background text-foreground antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  )
}

# 🗣️ Sheng Dictionary

> The definitive online dictionary for Sheng — Kenya's urban street language.  
> Built by Nairobi, for Nairobi.

**Live site:** [shengdictionary.co.ke](https://shengdictionary.co.ke)

---

## What Is This?

Sheng is a Swahili-English creole spoken by millions of Kenyan youth, born in the streets of Nairobi's Eastlands in the 1950s and now the everyday language of an entire generation. Despite how widely it's spoken, there's no quality digital resource for it.

This project is that resource — a fast, SEO-optimised, community-powered dictionary built to rank #1 on Google for every Sheng word search. Think Urban Dictionary, but made specifically for Sheng and built with Nairobi's energy.

---

## Features

- 🔍 **Search** — instant search across 100+ Sheng words
- 📖 **Word Pages** — every word has its own SEO-optimised page with definitions, usage examples, etymology, and related words
- 📅 **Word of the Day** — daily Sheng word delivered to subscribers every morning via email
- ✍️ **Community Submissions** — anyone can submit a word, reviewed by admin before going live
- 🛡️ **Admin Dashboard** — approve/reject submissions, manage words and subscribers
- 🗺️ **Auto Sitemap** — dynamically generated sitemap so Google indexes every word page
- 📱 **Mobile First** — designed for Nairobi youth on their phones

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict) |
| Database | MongoDB Atlas + Mongoose |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | NextAuth.js (magic link) |
| Email | Resend |
| Animations | Framer Motion |
| Hosting | Vercel |
| Package Manager | pnpm |

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- A MongoDB Atlas account (free tier works)
- A Resend account (free tier works)

### 1. Clone the repo

```bash
git clone https://github.com/YOURUSERNAME/sheng-dictionary.git
cd sheng-dictionary
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```env
MONGODB_URI=                    # From MongoDB Atlas
NEXTAUTH_SECRET=                # Run: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
RESEND_API_KEY=                 # From resend.com
EMAIL_FROM=noreply@shengdictionary.co.ke
ADMIN_EMAIL=                    # Your email — only this address can log into admin
CRON_SECRET=                    # Run: openssl rand -base64 32
NEXT_PUBLIC_GA_MEASUREMENT_ID=  # From Google Analytics (optional)
NEXT_PUBLIC_ADSENSE_ID=         # From Google AdSense (optional)
```

### 4. Seed the database

Load 100+ Sheng words into your database:

```bash
pnpm seed
```

### 5. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
sheng-dictionary/
├── middleware.ts                   # Protects /admin/* routes
├── scripts/
│   └── seed.ts                     # Database seed script
└── src/
    ├── app/
    │   ├── (public)/
    │   │   ├── page.tsx            # Homepage
    │   │   ├── word/[slug]/        # Individual word page
    │   │   ├── browse/             # Browse all words
    │   │   ├── submit/             # Public submission form
    │   │   └── word-of-the-day/    # Word of the day page
    │   ├── admin/                  # Protected admin dashboard
    │   │   ├── page.tsx            # Admin overview & stats
    │   │   ├── submissions/        # Review pending submissions
    │   │   ├── words/              # Manage all words
    │   │   └── subscribers/        # Manage email subscribers
    │   ├── api/                    # API routes
    │   │   ├── words/
    │   │   ├── submissions/
    │   │   ├── subscribers/
    │   │   ├── word-of-the-day/
    │   │   └── cron/
    │   ├── sitemap.ts              # Auto-generated sitemap
    │   └── robots.ts               # robots.txt
    ├── components/
    │   ├── ui/                     # shadcn/ui primitives
    │   ├── words/                  # Word cards, definition blocks
    │   ├── admin/                  # Admin-specific components
    │   └── shared/                 # Navbar, Footer, etc.
    ├── lib/
    │   ├── mongodb.ts              # DB connection with caching
    │   ├── auth.ts                 # NextAuth config
    │   ├── resend.ts               # Email helper
    │   └── utils.ts                # Slugify + utilities
    ├── models/
    │   ├── Word.ts
    │   ├── Submission.ts
    │   ├── Subscriber.ts
    │   └── WordOfTheDay.ts
    └── types/
        └── index.ts
```

---

## Admin Access

The admin dashboard lives at `/admin`. Access is restricted to the single email address set in `ADMIN_EMAIL`. Authentication uses a magic link sent via Resend — no password needed.

**Admin capabilities:**
- Review and approve or reject community word submissions
- Add, edit, and delete words directly
- View and manage email subscribers
- Monitor site stats (total words, pending submissions, subscriber count)

---

## Word of the Day

A Vercel Cron job runs daily at **8:00 AM EAT (5:00 AM UTC)**. It:

1. Picks a random approved word marked `isFeatured: true` that hasn't been word of the day in the last 90 days
2. Saves it to the `wordOfTheDay` collection
3. Sends an email to all active subscribers via Resend

The cron endpoint is protected by `CRON_SECRET` so only Vercel's scheduler can trigger it.

---

## Community Submissions

Anyone can submit a Sheng word at `/submit`. Submissions land in a separate `submissions` collection with status `pending` and never appear publicly until an admin approves them. Approved words are moved to the `words` collection and go live immediately.

---

## SEO

Every word gets its own page at `/word/[slug]` (e.g. `/word/poa`) with:

- Unique `<title>` — `Poa Meaning in Sheng | Sheng Dictionary`
- Unique meta description
- JSON-LD structured data (`DefinedTerm` schema)
- OpenGraph tags for social sharing
- Canonical URL
- ISR (Incremental Static Regeneration) with 1 hour revalidation

A dynamic `sitemap.xml` lists all approved word pages so Google can index them all.

---

## Deployment

This app is deployed on **Vercel** with the domain `shengdictionary.co.ke` registered through Truehost Kenya.

### Deploy your own

1. Push to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.local` in Vercel's project settings
4. Deploy
5. Add your custom domain in **Vercel → Settings → Domains**
6. Point your domain's DNS to Vercel:

```
Type: A      Name: @    Value: 76.76.21.21
Type: CNAME  Name: www  Value: cname.vercel-dns.com
```

SSL is automatic — Vercel provisions a free certificate via Let's Encrypt.

---

## Contributing

Words and language evolve fast. If you know a Sheng word that isn't in the dictionary yet, submit it at [shengdictionary.co.ke/submit](https://shengdictionary.co.ke/submit). All submissions are reviewed before going live.

---

## License

MIT

---

<p align="center">
  Made with ❤️ in Nairobi 🇰🇪
</p>
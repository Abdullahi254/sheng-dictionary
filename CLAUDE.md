# Sheng Dictionary — Project Bible

## What This App Is
A Sheng (Kenyan urban slang) dictionary web app. Think Urban Dictionary but specifically
for Sheng, built for SEO dominance, community submissions, and Gen Z aesthetics.
The goal is to rank #1 on Google for every Sheng word search query.
Target audience: Gen Z Kenyans, Sheng speakers, urban Nairobi youth.

---

## Tech Stack
- **Framework:** Next.js 14+ with App Router — use server components by default, client components only when needed
- **Language:** TypeScript strict mode — never use `any`
- **Database:** MongoDB Atlas via Mongoose
- **Styling:** Tailwind CSS + shadcn/ui components
- **Auth:** NextAuth.js (admin authentication only)
- **Email:** Resend (word of the day emails)
- **Animations:** Framer Motion
- **Package Manager:** pnpm (always use pnpm, never npm or yarn for project deps)
- **Hosting:** Vercel

---

## Component Library Rules
- ALWAYS use shadcn/ui components first before building anything custom
- Check if shadcn has a component for the use case before writing raw HTML/Tailwind
- Installed shadcn components: button, input, card, badge, dialog, toast
- To add a new shadcn component run: `pnpm dlx shadcn@latest add [component-name]`
- shadcn components live in `src/components/ui/` — never edit these files directly
- Compose shadcn primitives together to build more complex components
- Use shadcn's `cn()` utility from `src/lib/utils.ts` for conditional classNames
- For things shadcn does not cover (custom word cards, hero sections, animated elements) build custom components in `src/components/` using Tailwind + Framer Motion
- When in doubt: shadcn for functional UI (forms, dialogs, buttons, inputs), custom for branded/visual UI (hero, word cards, featured sections)

---

## Folder Structure
```
src/
├── app/                        # All pages and API routes (App Router)
│   ├── (public)/               # Public-facing pages
│   │   ├── page.tsx            # Homepage
│   │   ├── word/[slug]/        # Individual word page
│   │   ├── browse/             # Browse all words
│   │   ├── submit/             # Public word submission form
│   │   └── word-of-the-day/    # Word of the day page
│   ├── admin/                  # Admin dashboard (protected)
│   │   ├── page.tsx            # Admin overview
│   │   ├── submissions/        # Review pending submissions
│   │   ├── words/              # Manage approved words
│   │   └── subscribers/        # Manage email subscribers
│   ├── api/                    # API routes
│   │   ├── words/
│   │   ├── submissions/
│   │   ├── subscribers/
│   │   ├── word-of-the-day/
│   │   └── auth/
│   └── layout.tsx
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── words/                  # Word-specific components
│   ├── admin/                  # Admin-specific components
│   └── shared/                 # Shared components (Navbar, Footer, etc.)
├── lib/
│   ├── mongodb.ts              # MongoDB connection with caching
│   ├── auth.ts                 # NextAuth config
│   ├── resend.ts               # Email helper
│   └── utils.ts                # General utilities + slugify
├── models/
│   ├── Word.ts                 # Word mongoose model
│   ├── Submission.ts           # Submission mongoose model
│   ├── Subscriber.ts           # Subscriber mongoose model
│   └── WordOfTheDay.ts         # Word of the day model
└── types/
    └── index.ts                # All TypeScript type definitions
```

---

## Database Collections & Schemas

### words
```typescript
{
  word: string           // original word, lowercase
  slug: string           // URL-safe, unique (e.g. "poa", "msee")
  definitions: [{
    meaning: string      // the definition
    example: string      // usage example sentence
    addedBy: string      // admin username
  }]
  partOfSpeech: "noun" | "verb" | "adjective" | "expression" | "adverb"
  origin: string         // optional etymology
  relatedWords: string[] // array of slugs of related words
  region: string         // e.g. "Nationwide", "Eastlands", "Westlands"
  status: "pending" | "approved" | "rejected"
  viewCount: number      // default 0, increment on page visit
  isFeatured: boolean    // used for word of the day selection pool
  tags: string[]         // e.g. ["money", "greetings", "insults"]
  submittedBy: string    // can be "anonymous"
  createdAt: Date
  updatedAt: Date
}
```

### submissions
Same shape as words but separate collection. Status starts as "pending".
Admins review from here and either approve (moves to words) or reject.

### subscribers
```typescript
{
  email: string          // unique
  subscribedAt: Date
  isActive: boolean      // false = unsubscribed
  unsubscribeToken: string // unique token for one-click unsubscribe
}
```

### wordOfTheWeek
```typescript
{
  word: ObjectId         // ref to words collection
  weekStart: string      // YYYY-MM-DD format (Monday of that week), unique
}
```

---

## Features to Build (in this exact order)
1. MongoDB connection setup + all Mongoose models
2. TypeScript types
3. Homepage with search, word of the day card, recent words grid
4. Individual word page `/word/[slug]` with full SEO + structured data
5. Browse/listing page `/browse` with pagination and filters
6. Admin authentication with NextAuth
7. Admin dashboard — overview stats
8. Admin submissions review (approve / reject)
9. Admin word manager (add / edit / delete words)
10. Public word submission form (lands in submissions, not live)
11. Email subscription form + confirmation
12. Word of the week cron job (Vercel Cron)
13. Share Word as Image Feature
14. Auto-generated sitemap.xml
15. Google AdSense integration
16. Search with MongoDB Atlas Search or simple regex for MVP

---

## SEO Rules — Follow These Strictly on Every Word Page

- Use Next.js `generateMetadata` with unique title and description per word
- **Title format:** `[Word] Meaning in Sheng | Sheng Dictionary`
- **Description format:** `Learn what [word] means in Sheng. [First definition]. See usage examples and related Sheng words.`
- Include JSON-LD structured data using `DefinedTerm` schema on every word page
- All pages must have canonical URLs set
- Use ISR (Incremental Static Regeneration) on word pages — `revalidate: 3600`
- Generate `sitemap.xml` dynamically including all approved word slugs
- Generate `robots.txt` allowing all crawlers
- Word slugs must be clean: lowercase, hyphens only, no special characters
- Add OpenGraph tags for social sharing on every page
- `<h1>` on every word page must contain the word itself

### JSON-LD Example for Word Pages
```json
{
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  "name": "[word]",
  "description": "[first definition]",
  "inDefinedTermSet": {
    "@type": "DefinedTermSet",
    "name": "Sheng Dictionary"
  }
}
```

---

## Frontend Design Skill — READ BEFORE WRITING ANY UI CODE

This project uses a frontend design skill. Before writing any component, page, or layout, go through this full design thinking process.

### Design Thinking Process
Before touching code, answer these questions:
- **Purpose:** What problem does this UI element solve? Who is using it?
- **Tone:** What is the exact aesthetic direction? (commit to one — e.g. "Nairobi matatu maximalism" or "dark editorial street culture")
- **Differentiation:** What makes this screen UNFORGETTABLE? What will the user remember?
- **Constraints:** Mobile-first, performance, accessibility

**CRITICAL:** Choose a clear aesthetic direction and execute it with full precision. Do not hedge. Do not default to generic.

### This App's Aesthetic Identity
The Sheng Dictionary should feel like it was made BY Nairobi, FOR Nairobi.
- Inspiration: matatu culture, Nairobi nightlife, street art, Eastlands energy
- Feeling: bold, unapologetic, youthful, authentic — not polished corporate, not generic SaaS
- Dark mode default — deep blacks and near-blacks, not grey
- Accent colors: electric yellow-green, warm orange, or hot pink — pick one dominant accent and commit
- NO purple gradients on white. NO generic SaaS blue. NO cookie-cutter layouts.

### Typography Rules
- NEVER use Inter, Roboto, Arial, or system-ui as primary fonts
- Pick a distinctive display font for headings (something with character — think bold, geometric, or editorial)
- Pair with a readable but interesting body font
- Import from Google Fonts in the Next.js layout
- Type should feel like it belongs on a Nairobi street poster

### Color Rules
- Use CSS variables for ALL colors defined in `globals.css`
- Dark background dominant, one sharp vibrant accent, one muted secondary
- Avoid even distribution — let the accent punch through sparingly
- Cards and surfaces should have subtle depth, not flat solid colors

### Motion & Animation (use Framer Motion)
- Stagger word cards on page load (each card with increasing delay)
- Page transitions between routes
- Hover states on word cards that feel alive
- One dramatic hero animation on the homepage
- Do NOT animate everything — high-impact moments only

### Spatial Composition
- Mobile-first layouts
- On desktop: break the grid intentionally — overlap elements, use asymmetry
- Generous negative space around key content
- Word cards should have personality, not just be plain rectangles

### Backgrounds & Visual Depth
- Never use a plain solid black or white background
- Use subtle noise texture overlays, gradient meshes, or geometric patterns
- Word of the day card should be a showpiece — make it visually dramatic
- Footer can have a distinctive treatment (gradient, texture, border top accent)

### Things to NEVER Do
- Do not use purple gradients on white
- Do not use predictable layouts that look like every Next.js tutorial
- Do not use Space Grotesk, Plus Jakarta Sans, or any overused AI-gen font choices
- Do not make components that look assembled from a UI kit without design intent
- Do not ignore mobile — test every component at 375px width

---

## Environment Variables
Create `.env.local` with these (never commit this file):
```
MONGODB_URI=                    # From MongoDB Atlas
NEXTAUTH_SECRET=                # Random string, generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
RESEND_API_KEY=                 # From resend.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=  # From Google Analytics
NEXT_PUBLIC_ADSENSE_ID=         # From Google AdSense
ADMIN_EMAIL=                    # Your email, the only one that can log into admin
CRON_SECRET=                    # Random string to protect cron endpoints
```

---

## Coding Conventions
- TypeScript strict mode — no `any`, no `@ts-ignore`
- Server components by default, add `"use client"` only when needed (event handlers, hooks, browser APIs)
- Use server actions for form submissions where possible
- Always handle loading states, error states, and empty states in UI
- Use Mongoose for all DB operations — never raw MongoDB driver
- Slugify all word names: lowercase, strip special characters, replace spaces with hyphens
- All admin routes check for valid NextAuth session at the top — redirect to login if not authenticated
- API routes return consistent JSON: `{ success: true, data: {} }` or `{ success: false, error: "message" }`
- Comment complex logic
- Use `next/image` for all images with proper alt text
- Use `next/link` for all internal navigation

---

## Admin Access
- Only one admin email defined in `ADMIN_EMAIL` env var can log in
- Use NextAuth with Email provider (magic link) or GitHub provider
- Admin routes: `/admin/*` — all protected via middleware
- Admin can: approve/reject submissions, add/edit/delete words, manage subscribers, set word of the day

## Word of the Week Logic
- A Vercel Cron job runs every Monday at 8:00 AM EAT (5:00 AM UTC)
- Cron schedule: `0 5 * * 1` (the `1` means Monday)
- It picks a random word from approved words where `isFeatured: true` that hasn't been word of the week in the last 52 weeks
- Saves it to `wordOfTheWeek` collection with the Monday date of that week as `weekStart`
- Sends email to all active subscribers via Resend
- Email subject: `This Week's Sheng Word: [word] 🔥`
- The homepage displays the current week's word by looking up the record where `weekStart` equals the most recent Monday

## Public Submission Flow
1. User fills form at `/submit` — word, definition, example, their name (optional)
2. Submission saved to `submissions` collection with status `pending`
3. Admin sees it in `/admin/submissions`
4. Admin approves → word moves to `words` collection with status `approved` → appears on site
5. Admin rejects → status set to `rejected` → never appears publicly

## Share Word as Image Feature

**Component:** `src/components/words/ShareWordButton.tsx`
**Utility:** `src/lib/generateWordImage.ts`

### Canvas Spec (1080×1080px)
- Background: dark gradient `#0a0a0a` → `#1a1a1a` with noise texture drawn via canvas
- Word text: dominant, large, display font (Playfair Display or Libre Baskerville loaded via FontFace API)
- Accent color `#39FF14` for: part-of-speech label, thin rule line, bottom branding
- Definition: clean sans-serif, white, wrapped to 2–3 lines max
- Example sentence: italic, muted grey
- Bottom bar: `shengdictionary.co.ke` left, `Sheng Dictionary` right — both in accent
- Optional: word text repeated large, 5% opacity, rotated 15°, as background watermark layer

### Share Flow
1. User clicks **Share Word** button on any word page
2. Canvas renders off-screen (not appended to DOM)
3. Canvas → PNG Blob via `canvas.toBlob()`
4. If `navigator.share` + `files` supported → open native share sheet (WhatsApp, IG Stories, X)
5. If not supported (desktop) → auto-download as `[word]-sheng-dictionary.png`
6. Show toast: `"Image ready to share! 🔥"`

### Implementation Rules
- Load Google Font via `FontFace` API — `await font.load()` before any canvas draw call
- Fall back to `Georgia, serif` if font fails to load — never let a font error break the feature
- Show loading spinner on button during generation
- Never use an external image generation service — canvas only, runs entirely client-side
- Export `generateWordImage(word: WordType): Promise<Blob>` from `src/lib/generateWordImage.ts`
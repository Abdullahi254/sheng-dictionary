// =============================================================
// Sheng Dictionary — Set Word of the Week (manual trigger)
// =============================================================
// Picks a random approved+featured word and sets it as this
// week's Word of the Week in MongoDB.
// Run: pnpm set-wotw
// =============================================================

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// ── Inline schemas (avoids Next.js module resolution) ─────────
const wordSchema = new mongoose.Schema({
  word: String,
  slug: String,
  definitions: [{ meaning: String, example: String, addedBy: String }],
  partOfSpeech: String,
  status: String,
  isFeatured: Boolean,
}, { timestamps: true })

const wotwSchema = new mongoose.Schema({
  word: { type: mongoose.Schema.Types.ObjectId, ref: 'Word' },
  weekStart: { type: String, unique: true },
})

const Word = mongoose.models.Word || mongoose.model('Word', wordSchema)
const WordOfTheWeek = mongoose.models.WordOfTheWeek || mongoose.model('WordOfTheWeek', wotwSchema)

// ── getCurrentWeekStart ────────────────────────────────────────
function getCurrentWeekStart(): string {
  const now = new Date()
  const day = now.getUTCDay() // 0 = Sunday, 1 = Monday
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setUTCDate(now.getUTCDate() + diff)
  return monday.toISOString().slice(0, 10)
}

// ── Main ───────────────────────────────────────────────────────
async function run() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('❌  MONGODB_URI not found in .env.local')
    process.exit(1)
  }

  console.log('🔌  Connecting to MongoDB...')
  await mongoose.connect(uri)
  console.log('✅  Connected!\n')

  const weekStart = getCurrentWeekStart()
  console.log(`📅  Current week starts: ${weekStart}`)

  // Check if already set
  const existing = await WordOfTheWeek.findOne({ weekStart }).populate('word')
  if (existing) {
    const w = existing.word as { word?: string }
    console.log(`ℹ️   Word of the Week already set for this week: "${w?.word ?? existing.word}"`)
    await mongoose.disconnect()
    process.exit(0)
  }

  // Exclude words used in the last 52 weeks
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 364)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  const recentWordIds = await WordOfTheWeek.find({ weekStart: { $gte: cutoffStr } }).distinct('word')

  const candidates = await Word.aggregate([
    {
      $match: {
        status: 'approved',
        isFeatured: true,
        _id: { $nin: recentWordIds },
      },
    },
    { $sample: { size: 1 } },
  ])

  if (!candidates.length) {
    console.error('❌  No eligible featured+approved words found. Make sure words are seeded.')
    await mongoose.disconnect()
    process.exit(1)
  }

  const picked = candidates[0]
  await WordOfTheWeek.create({ word: picked._id, weekStart })

  console.log(`\n🔥  Word of the Week set!`)
  console.log(`    Word:       "${picked.word}"`)
  console.log(`    Week start: ${weekStart}`)
  console.log(`    Definition: ${picked.definitions?.[0]?.meaning ?? '(none)'}`)

  await mongoose.disconnect()
  process.exit(0)
}

run().catch((err) => {
  console.error('💥  Failed:', err)
  process.exit(1)
})

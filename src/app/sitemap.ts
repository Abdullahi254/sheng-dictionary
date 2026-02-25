import type { MetadataRoute } from 'next'

import connectToDatabase from '@/lib/mongodb'
import Word from '@/models/Word'

const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://shengdictionary.co.ke'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Static pages ────────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/browse`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/submit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // ── Dynamic word pages ───────────────────────────────────────────────────────
  try {
    await connectToDatabase()

    const words = await Word.find({ status: 'approved' })
      .select('slug updatedAt')
      .lean()

    const wordPages: MetadataRoute.Sitemap = words.map((w) => ({
      url: `${BASE_URL}/word/${w.slug}`,
      lastModified: new Date(w.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.9,
    }))

    return [...staticPages, ...wordPages]
  } catch (err) {
    console.error('[sitemap] DB fetch error:', err)
    // Fall back to static pages only so the sitemap never hard-fails
    return staticPages
  }
}

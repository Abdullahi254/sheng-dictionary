import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://shengdictionary.co.ke'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}

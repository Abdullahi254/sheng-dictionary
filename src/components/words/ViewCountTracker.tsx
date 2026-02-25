'use client'

import { useEffect } from 'react'

interface ViewCountTrackerProps {
  slug: string
}

// Renders nothing — fires a view increment on mount so every real user
// visit is counted, even when the ISR-cached page is served from edge.
export function ViewCountTracker({ slug }: ViewCountTrackerProps) {
  useEffect(() => {
    fetch(`/api/words/${slug}/view`, { method: 'POST' }).catch(() => {
      // Non-critical — silently ignore failures
    })
  }, [slug])

  return null
}

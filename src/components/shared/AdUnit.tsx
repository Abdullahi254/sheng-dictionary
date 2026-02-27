"use client"

import { useEffect } from "react"

interface AdUnitProps {
  slot: string
  className?: string
}

export default function AdUnit({ slot, className }: AdUnitProps) {
  useEffect(() => {
    try {
      // @ts-expect-error adsbygoogle is injected by Google script
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (err) {
      console.error("AdSense error:", err)
    }
  }, [])

  return (
    <ins
      className={`adsbygoogle block ${className ?? ""}`}
      style={{ display: "block" }}
      data-ad-client="ca-pub-5366695242791546"
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}

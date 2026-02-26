import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns the most recent Monday as a YYYY-MM-DD string.
 * If today is Monday it returns today; otherwise it walks back to Monday.
 */
export function getCurrentWeekStart(): string {
  const now = new Date()
  const day = now.getUTCDay() // 0 = Sunday, 1 = Monday, …
  const diff = day === 0 ? -6 : 1 - day // days to subtract to reach Monday
  const monday = new Date(now)
  monday.setUTCDate(now.getUTCDate() + diff)
  return monday.toISOString().slice(0, 10) // YYYY-MM-DD
}

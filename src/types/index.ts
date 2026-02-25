// ─── Shared primitives ───────────────────────────────────────────────────────

export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'expression' | 'adverb'
export type WordStatus = 'pending' | 'approved' | 'rejected'

// ─── Definition ──────────────────────────────────────────────────────────────

export interface IDefinition {
  meaning: string
  example: string
  addedBy: string
}

// ─── Word ────────────────────────────────────────────────────────────────────

export interface IWord {
  _id: string
  word: string
  slug: string
  definitions: IDefinition[]
  partOfSpeech: PartOfSpeech
  origin?: string
  relatedWords: string[]   // array of slugs
  region: string           // e.g. "Nationwide", "Eastlands", "Westlands"
  status: WordStatus
  viewCount: number
  isFeatured: boolean
  tags: string[]
  submittedBy: string      // username or "anonymous"
  createdAt: Date
  updatedAt: Date
}

// ─── Submission ───────────────────────────────────────────────────────────────
// Same shape as Word — separate collection, status starts as "pending".

export interface ISubmission {
  _id: string
  word: string
  slug: string
  definitions: IDefinition[]
  partOfSpeech: PartOfSpeech
  origin?: string
  relatedWords: string[]
  region: string
  status: WordStatus
  viewCount: number
  isFeatured: boolean
  tags: string[]
  submittedBy: string
  createdAt: Date
  updatedAt: Date
}

// ─── Subscriber ───────────────────────────────────────────────────────────────

export interface ISubscriber {
  _id: string
  email: string
  subscribedAt: Date
  isActive: boolean
  unsubscribeToken: string
}

// ─── Word of the Day ──────────────────────────────────────────────────────────

export interface IWordOfTheDay {
  _id: string
  word: string | IWord   // ObjectId ref — may be populated to full IWord
  date: string           // YYYY-MM-DD
}

// ─── API response envelope ────────────────────────────────────────────────────

export type ApiSuccess<T> = { success: true; data: T }
export type ApiError = { success: false; error: string }
export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

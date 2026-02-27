import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IDefinition {
  meaning: string
  example: string
  addedBy: string
}

export interface IWordDocument extends Document {
  word: string
  slug: string
  definitions: IDefinition[]
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'expression' | 'adverb'
  origin?: string
  relatedWords: string[]
  region: string
  status: 'pending' | 'approved' | 'rejected'
  viewCount: number
  isFeatured: boolean
  tags: string[]
  submittedBy: string
  createdAt: Date
  updatedAt: Date
}

const DefinitionSchema = new Schema<IDefinition>(
  {
    meaning: { type: String, required: true },
    example: { type: String, required: true },
    addedBy: { type: String, required: true },
  },
  { _id: false }
)

const WordSchema = new Schema<IWordDocument>(
  {
    word: { type: String, required: true, lowercase: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    definitions: { type: [DefinitionSchema], required: true },
    partOfSpeech: {
      type: String,
      enum: ['noun', 'verb', 'adjective', 'expression', 'adverb'],
      required: true,
    },
    origin: { type: String },
    relatedWords: { type: [String], default: [] },
    region: { type: String, required: true, default: 'Nationwide' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    viewCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    submittedBy: { type: String, default: 'anonymous' },
  },
  { timestamps: true }
)

// Index for search performance
WordSchema.index({ word: 'text', 'definitions.meaning': 'text' })
WordSchema.index({ status: 1 })
// slug index is created automatically by unique: true on the field

const Word: Model<IWordDocument> =
  mongoose.models.Word ?? mongoose.model<IWordDocument>('Word', WordSchema)

export default Word

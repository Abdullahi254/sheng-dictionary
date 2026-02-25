import mongoose, { Schema, Document, Model } from 'mongoose'

// Submissions have the same shape as words — separate collection,
// status always starts as "pending". Admins approve or reject from here.

export interface ISubmissionDefinition {
  meaning: string
  example: string
  addedBy: string
}

export interface ISubmissionDocument extends Document {
  word: string
  slug: string
  definitions: ISubmissionDefinition[]
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

const SubmissionDefinitionSchema = new Schema<ISubmissionDefinition>(
  {
    meaning: { type: String, required: true },
    example: { type: String, required: true },
    addedBy: { type: String, required: true },
  },
  { _id: false }
)

const SubmissionSchema = new Schema<ISubmissionDocument>(
  {
    word: { type: String, required: true, lowercase: true, trim: true },
    slug: { type: String, required: true, lowercase: true },
    definitions: { type: [SubmissionDefinitionSchema], required: true },
    partOfSpeech: {
      type: String,
      enum: ['noun', 'verb', 'adjective', 'expression', 'adverb'],
      required: true,
    },
    origin: { type: String },
    relatedWords: { type: [String], default: [] },
    region: { type: String, default: 'Nationwide' },
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

SubmissionSchema.index({ status: 1 })
SubmissionSchema.index({ createdAt: -1 })

const Submission: Model<ISubmissionDocument> =
  mongoose.models.Submission ??
  mongoose.model<ISubmissionDocument>('Submission', SubmissionSchema)

export default Submission

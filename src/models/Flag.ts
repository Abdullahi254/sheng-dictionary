import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IFlagDocument extends Document {
  wordId: mongoose.Types.ObjectId
  wordSlug: string
  wordName: string
  reason: 'not_sheng' | 'mistranslation' | 'offensive' | 'outdated' | 'other'
  suggestion: string
  reportedBy: string
  status: 'pending' | 'resolved' | 'dismissed'
  createdAt: Date
  updatedAt: Date
}

const FlagSchema = new Schema<IFlagDocument>(
  {
    wordId: { type: Schema.Types.ObjectId, ref: 'Word', required: true },
    wordSlug: { type: String, required: true },
    wordName: { type: String, required: true },
    reason: {
      type: String,
      enum: ['not_sheng', 'mistranslation', 'offensive', 'outdated', 'other'],
      required: true,
    },
    suggestion: { type: String, default: '' },
    reportedBy: { type: String, default: 'anonymous' },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending',
    },
  },
  { timestamps: true }
)

FlagSchema.index({ status: 1 })
FlagSchema.index({ wordId: 1 })

const Flag: Model<IFlagDocument> =
  mongoose.models.Flag ?? mongoose.model<IFlagDocument>('Flag', FlagSchema)

export default Flag

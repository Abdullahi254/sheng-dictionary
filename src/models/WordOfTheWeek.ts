import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IWordOfTheWeekDocument extends Document {
  word: mongoose.Types.ObjectId
  weekStart: string // YYYY-MM-DD — the Monday of that week, unique
}

const WordOfTheWeekSchema = new Schema<IWordOfTheWeekDocument>({
  word: { type: Schema.Types.ObjectId, ref: 'Word', required: true },
  weekStart: { type: String, required: true, unique: true }, // YYYY-MM-DD (Monday)
})

// weekStart index is created automatically by unique: true on the field
const WordOfTheWeek: Model<IWordOfTheWeekDocument> =
  mongoose.models.WordOfTheWeek ??
  mongoose.model<IWordOfTheWeekDocument>('WordOfTheWeek', WordOfTheWeekSchema)

export default WordOfTheWeek

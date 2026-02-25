import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IWordOfTheDayDocument extends Document {
  word: mongoose.Types.ObjectId
  date: string // YYYY-MM-DD format, unique
}

const WordOfTheDaySchema = new Schema<IWordOfTheDayDocument>({
  word: { type: Schema.Types.ObjectId, ref: 'Word', required: true },
  date: { type: String, required: true, unique: true }, // YYYY-MM-DD
})

WordOfTheDaySchema.index({ date: 1 })

const WordOfTheDay: Model<IWordOfTheDayDocument> =
  mongoose.models.WordOfTheDay ??
  mongoose.model<IWordOfTheDayDocument>('WordOfTheDay', WordOfTheDaySchema)

export default WordOfTheDay

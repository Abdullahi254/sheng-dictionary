import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISubscriberDocument extends Document {
  email: string
  subscribedAt: Date
  isActive: boolean
  unsubscribeToken: string
}

const SubscriberSchema = new Schema<ISubscriberDocument>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  subscribedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  unsubscribeToken: { type: String, required: true, unique: true },
})

SubscriberSchema.index({ email: 1 })
SubscriberSchema.index({ unsubscribeToken: 1 })

const Subscriber: Model<ISubscriberDocument> =
  mongoose.models.Subscriber ??
  mongoose.model<ISubscriberDocument>('Subscriber', SubscriberSchema)

export default Subscriber

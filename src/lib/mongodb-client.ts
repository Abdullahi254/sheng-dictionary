// Standalone MongoClient singleton used by the NextAuth MongoDB adapter.
// Kept separate from the Mongoose connection in mongodb.ts.
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI!

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local')
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient>
}

let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development, reuse the client across HMR reloads
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  const client = new MongoClient(uri)
  clientPromise = client.connect()
}

export default clientPromise

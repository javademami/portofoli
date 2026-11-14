import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

type MongoCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalWithMongoose = global as unknown as { mongoose?: MongoCache };

function ensureCache(): MongoCache {
  if (!globalWithMongoose.mongoose) {
    globalWithMongoose.mongoose = { conn: null, promise: null };
  }
  return globalWithMongoose.mongoose!;
}

const cached = ensureCache();

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((instance) => instance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
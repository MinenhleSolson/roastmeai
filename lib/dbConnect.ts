// lib/dbConnect.ts
import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Define MONGODB_URI in .env.local'
  );
}

// Module-level cache
interface MongooseCache {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

// Initialize cache within the module scope
let cache: MongooseCache = { conn: null, promise: null };


async function dbConnect(): Promise<Mongoose> { // Return type Mongoose (the instance type)
  if (cache.conn) {
    console.log('DB using cached connection.');
    return cache.conn;
  }

  if (!cache.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('DB creating new connection.');
    // mongoose.connect returns Promise<Mongoose> (the instance)
    cache.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      console.log('DB connection successful.');
      return mongooseInstance; // resolves with the Mongoose instance
    }).catch(error => {
        console.error('DB connection error:', error);
        cache.promise = null; // Reset promise on error
        throw error;
    });
  }

  try {
    // Await the promise, which resolves to the Mongoose instance
    cache.conn = await cache.promise;
  } catch (e) {
    cache.promise = null;
    throw e;
  }

  return cache.conn; // Return the resolved Mongoose instance
}

export default dbConnect;
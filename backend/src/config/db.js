import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export async function connectDB() {
  const url = process.env.MONGO_URL;
  if(!url) throw new Error('MONGO_URL not set');
  await mongoose.connect(url, { dbName: process.env.MONGO_DB || 'minicrm' });
  console.log('MongoDB connected');
}

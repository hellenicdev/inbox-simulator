import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Sender from '../models/Sender.js';
import { senders } from './data.js';

async function seed() {
  await connectDB();
  await Sender.deleteMany({});
  await Sender.insertMany(senders);
  console.log(`Seeded ${senders.length} senders`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

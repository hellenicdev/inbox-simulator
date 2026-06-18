import mongoose from 'mongoose';

const senderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  archetype: {
    type: String,
    required: true,
  },
  writingStylePrompt: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['business', 'tech', 'media', 'sports', 'entertainment', 'influence'],
    required: true,
  },
});

export default mongoose.model('Sender', senderSchema);

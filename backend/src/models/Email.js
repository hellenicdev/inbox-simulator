import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
  folder: {
    type: String,
    enum: ['inbox', 'archive', 'spam'],
    default: 'inbox',
  },
  category: {
    type: String,
    default: 'general',
  },
});

emailSchema.index({ userId: 1, folder: 1, timestamp: -1 });
emailSchema.index({ userId: 1, subject: 'text', body: 'text' });

export default mongoose.model('Email', emailSchema);

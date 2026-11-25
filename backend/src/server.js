import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import emailRoutes from './routes/emails.js';
import senderRoutes from './routes/sender.js';
import Sender from './models/Sender.js';
import { senders as seedSenders } from './seed/data.js';
import { apiLimiter, authLimiter } from './middleware/rateLimit.js';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Refusing to start.');
  process.exit(1);
}

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;

// CORS is restricted to the production site.
const ALLOWED_ORIGIN = 'https://hellenicdev.eu';

app.use(cors({
  origin: ALLOWED_ORIGIN,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
}));

app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/senders', senderRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') {
    return res.status(err.status || 400).json({ error: 'Invalid request body' });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

async function autoSeed() {
  const count = await Sender.countDocuments();
  if (count === 0) {
    await Sender.insertMany(seedSenders);
    console.log(`Seeded ${seedSenders.length} sender archetypes`);
  }
}

async function start() {
  await connectDB();
  await autoSeed();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

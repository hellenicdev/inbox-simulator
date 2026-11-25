import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import Email from '../models/Email.js';
import mongoose from 'mongoose';
import { generateEmailsForUser } from '../services/emailGenerator.js';
import { generateLimiter } from '../middleware/rateLimit.js';

const router = Router();
router.use(authMiddleware);

const FOLDERS = ['inbox', 'archive', 'spam'];
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toInt = (value, fallback, min, max) => {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
};

router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    const folder = FOLDERS.includes(req.query.folder) ? req.query.folder : 'inbox';
    const page = toInt(req.query.page, 1, 1, 10000);
    const limit = toInt(req.query.limit, 20, 1, 100);
    const filter = { userId: req.userId, folder };

    if (typeof category === 'string' && category) {
      filter.category = category;
    }

    if (typeof search === 'string' && search.trim()) {
      const pattern = escapeRegex(search.trim().slice(0, 100));
      filter.$or = [
        { subject: { $regex: pattern, $options: 'i' } },
        { body: { $regex: pattern, $options: 'i' } },
        { senderName: { $regex: pattern, $options: 'i' } },
      ];
    }

    const [emails, total] = await Promise.all([
      Email.find(filter)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Email.countDocuments(filter),
    ]);

    res.json({
      emails,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Fetch emails error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/refresh', generateLimiter, async (req, res) => {
  try {
    const newEmails = await generateEmailsForUser(req.userId, 2);
    res.json({ generated: newEmails.length, emails: newEmails });
  } catch (err) {
    const msg = err.message || 'Generation failed';
    const isQuota = msg.includes('quota') || msg.includes('429');
    console.error('Refresh error:', isQuota ? 'Gemini quota exhausted' : msg);
    res.status(isQuota ? 429 : 500).json({
      error: isQuota ? 'AI generation quota exceeded. Try again later.' : 'Generation failed',
    });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: 'Email not found' });
    }
    const { read, folder } = req.body || {};
    const update = {};
    if (read !== undefined) {
      if (typeof read !== 'boolean') return res.status(400).json({ error: 'read must be true or false' });
      update.read = read;
    }
    if (folder !== undefined) {
      if (!FOLDERS.includes(folder)) return res.status(400).json({ error: 'Invalid folder' });
      update.folder = folder;
    }
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    const email = await Email.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      update,
      { new: true }
    );

    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    res.json(email);
  } catch (err) {
    console.error('Update email error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

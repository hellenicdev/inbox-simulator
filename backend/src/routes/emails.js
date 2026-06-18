import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import Email from '../models/Email.js';
import { generateEmailsForUser } from '../services/emailGenerator.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { folder = 'inbox', search, category, page = 1, limit = 20 } = req.query;
    const filter = { userId: req.userId, folder };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } },
        { senderName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const emails = await Email.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Email.countDocuments(filter);

    res.json({
      emails,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error('Fetch emails error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/refresh', async (req, res) => {
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
    const { read, folder } = req.body;
    const update = {};
    if (read !== undefined) update.read = read;
    if (folder !== undefined) update.folder = folder;

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

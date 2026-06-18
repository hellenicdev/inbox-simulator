import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import Sender from '../models/Sender.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (_req, res) => {
  try {
    const senders = await Sender.find({}).sort({ name: 1 }).lean();
    res.json(senders);
  } catch (err) {
    console.error('Fetch senders error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

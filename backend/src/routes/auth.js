import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { verifyTurnstileToken } from '../services/turnstile.js';

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readCredentials(body = {}) {
  const { email, password, turnstileToken } = body;
  if (typeof email !== 'string' || typeof password !== 'string') return null;
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) return null;
  return { email: normalized, password, turnstileToken };
}

router.post('/register', async (req, res) => {
  try {
    const creds = readCredentials(req.body);
    if (!creds) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const { email, password, turnstileToken } = creds;
    if (!EMAIL_RE.test(email) || email.length > 254) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    if (password.length < 6 || password.length > 128) {
      return res.status(400).json({ error: 'Password must be 6 to 128 characters' });
    }
    if (!(await verifyTurnstileToken(turnstileToken))) {
      return res.status(403).json({ error: 'Security check failed. Please try again.' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, email: user.email });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const creds = readCredentials(req.body);
    if (!creds) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const { email, password, turnstileToken } = creds;
    if (!(await verifyTurnstileToken(turnstileToken))) {
      return res.status(403).json({ error: 'Security check failed. Please try again.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, email: user.email });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

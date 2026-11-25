import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const keyGenerator = (req) => ipKeyGenerator(req.ip);

function limiter(windowMs, limit, error) {
  return rateLimit({
    windowMs,
    limit,
    keyGenerator,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, res) => res.status(429).json({ error }),
  });
}

// Whole API
export const apiLimiter = limiter(15 * 60 * 1000, 300, 'Too many requests. Please slow down.');
// Login / register
export const authLimiter = limiter(15 * 60 * 1000, 20, 'Too many sign-in attempts. Please try again later.');
// AI email generation is expensive
export const generateLimiter = limiter(60 * 1000, 5, 'You are refreshing too fast. Please wait a minute.');

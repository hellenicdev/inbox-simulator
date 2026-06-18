import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

export function getGemini() {
  if (!genAI) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY not set');
    genAI = new GoogleGenerativeAI(key);
  }
  return genAI;
}

export function getModel() {
  const ai = getGemini();
  return ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
}

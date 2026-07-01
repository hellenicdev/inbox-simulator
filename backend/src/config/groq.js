import Groq from 'groq-sdk';

let client = null;

export function getGroq() {
  if (!client) {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error('GROQ_API_KEY not set');
    client = new Groq({ apiKey: key });
  }
  return client;
}

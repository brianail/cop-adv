import { put } from '@vercel/blob';
import { requireAuth } from '../lib/auth.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).end();
  if (!requireAuth(req, res)) return;

  const filename = req.query.filename;
  if (!filename) return res.status(400).json({ error: 'filename obrigatório' });

  // lê o body como stream (imagem)
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);

  const blob = await put(`blog/${Date.now()}-${filename}`, buffer, {
    access: 'public',
    contentType: req.headers['content-type'] || 'image/jpeg',
  });

  res.status(200).json({ url: blob.url });
}

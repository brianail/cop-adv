import { initDB } from '../lib/db.js';
import { requireAuth } from '../lib/auth.js';

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;
  await initDB();
  res.status(200).json({ ok: true, message: 'Tabela posts criada (ou já existia).' });
}

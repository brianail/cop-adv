import { initDB } from '../lib/db.js';

export default async function handler(req, res) {
  await initDB();
  res.status(200).json({ ok: true, message: 'Tabela posts criada (ou já existia).' });
}
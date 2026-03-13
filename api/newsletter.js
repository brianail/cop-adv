import { sql } from '../lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — lista inscritos (protegido por query param secret)
  if (req.method === 'GET') {
    const { secret } = req.query;
    if (secret !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    const result = await sql`
      SELECT email, created_at FROM newsletter
      ORDER BY created_at DESC
    `;
    return res.status(200).json(result.rows);
  }

  // POST — inscrever email
  if (req.method === 'POST') {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'E-mail inválido' });
    }

    try {
      await sql`
        INSERT INTO newsletter (email)
        VALUES (${email.toLowerCase().trim()})
        ON CONFLICT (email) DO NOTHING
      `;
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao salvar e-mail' });
    }
  }

  res.status(405).end();
}
import { sql } from '../lib/db.js';
import { requireAuth } from '../lib/auth.js';
import { applyCors } from '../lib/cors.js';
import { validateNewsletterEmail } from '../lib/validate.js';

export default async function handler(req, res) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      if (!requireAuth(req, res)) return;
      const result = await sql`
        SELECT email, created_at FROM newsletter
        ORDER BY created_at DESC
      `;
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      const email = validateNewsletterEmail(req.body?.email);
      if (!email) return res.status(400).json({ error: 'E-mail inválido' });

      await sql`
        INSERT INTO newsletter (email)
        VALUES (${email})
        ON CONFLICT (email) DO NOTHING
      `;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      if (!requireAuth(req, res)) return;
      const email = validateNewsletterEmail(req.body?.email);
      if (!email) return res.status(400).json({ error: 'E-mail inválido.' });

      const del = await sql`DELETE FROM newsletter WHERE email = ${email} RETURNING email`;
      if (!del.rows.length) return res.status(404).json({ error: 'E-mail não encontrado.' });
      return res.status(200).json({ ok: true });
    }
  } catch (err) {
    console.error('newsletter', err);
    return res.status(500).json({ error: 'Erro ao processar a solicitação.' });
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}

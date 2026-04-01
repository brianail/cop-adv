import { sql } from '../lib/db.js';
import { requireAuth, optionalAuth } from '../lib/auth.js';
import { applyCors } from '../lib/cors.js';

export default async function handler(req, res) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const showAll = optionalAuth(req);
      const { active, limit } = req.query;
      const lim = Math.max(1, Math.min(100, parseInt(limit) || 20));

      if (active === 'true' || !showAll) {
        const result = await sql`
          SELECT * FROM shorts
          WHERE active = true
          ORDER BY created_at DESC
          LIMIT ${lim}
        `;
        return res.status(200).json(result.rows);
      }

      const result = await sql`
        SELECT * FROM shorts
        ORDER BY created_at DESC
        LIMIT ${lim}
      `;
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      if (!requireAuth(req, res)) return;
      const { yt_id, title } = req.body || {};
      if (!yt_id || typeof yt_id !== 'string') return res.status(400).json({ error: 'A URL ou ID do Short é obrigatória.' });

      const result = await sql`
        INSERT INTO shorts (yt_id, title, active)
        VALUES (${yt_id.trim()}, ${title || 'Short COP Advogados'}, true)
        RETURNING *
      `;
      return res.status(201).json(result.rows[0]);
    }

    if (req.method === 'PUT') {
      if (!requireAuth(req, res)) return;
      const { id, active, title } = req.body || {};
      if (!id) return res.status(400).json({ error: 'ID inválido.' });

      if (title !== undefined) {
        const result = await sql`
          UPDATE shorts
          SET active = ${Boolean(active)}, title = ${title}
          WHERE id = ${parseInt(id)}
          RETURNING *
        `;
        return res.status(200).json(result.rows[0]);
      } else {
        const result = await sql`
          UPDATE shorts
          SET active = ${Boolean(active)}
          WHERE id = ${parseInt(id)}
          RETURNING *
        `;
        return res.status(200).json(result.rows[0]);
      }
    }

    if (req.method === 'DELETE') {
      if (!requireAuth(req, res)) return;
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'ID não fornecido.' });

      await sql`DELETE FROM shorts WHERE id = ${parseInt(id)}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (err) {
    console.error('API Shorts:', err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

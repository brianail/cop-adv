import { sql } from '../lib/db.js';
import { requireAuth, optionalAuth } from '../lib/auth.js';
import { applyCors } from '../lib/cors.js';

export default async function handler(req, res) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const showDrafts = optionalAuth(req);
      const { active, limit } = req.query;
      const lim = Math.max(1, Math.min(100, parseInt(limit) || 20));

      // Se só quer ativos, ou se é usuário comum (não-admin) então forçamos listar ativos
      if (active === 'true' || !showDrafts) {
        const result = await sql`
          SELECT * FROM videos
          WHERE active = true
          ORDER BY created_at DESC
          LIMIT ${lim}
        `;
        return res.status(200).json(result.rows);
      }

      // Senão, pro admin listamos todos
      const result = await sql`
        SELECT * FROM videos
        ORDER BY created_at DESC
        LIMIT ${lim}
      `;
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      if (!requireAuth(req, res)) return;
      const { yt_id, title } = req.body || {};
      if (!yt_id || typeof yt_id !== 'string') return res.status(400).json({ error: 'A URL ou ID do vídeo é obrigatória.' });

      const result = await sql`
        INSERT INTO videos (yt_id, title, active)
        VALUES (${yt_id.trim()}, ${title || 'Vídeo sem título'}, true)
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
            UPDATE videos
            SET active = ${Boolean(active)}, title = ${title}
            WHERE id = ${parseInt(id)}
            RETURNING *
          `;
          return res.status(200).json(result.rows[0]);
      } else {
          const result = await sql`
            UPDATE videos
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

      await sql`DELETE FROM videos WHERE id = ${parseInt(id)}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (err) {
    console.error('API Videos:', err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

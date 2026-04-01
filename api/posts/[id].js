import { sql } from '../../lib/db.js';
import { requireAuth } from '../../lib/auth.js';
import { applyCors } from '../../lib/cors.js';
import { parsePostId, validatePostInput } from '../../lib/validate.js';

export default async function handler(req, res) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const id = parsePostId(req.query.id);
  if (!id) {
    if (req.method === 'GET') return res.status(404).json({ error: 'Post não encontrado' });
    return res.status(400).json({ error: 'ID inválido.' });
  }

  try {
    if (req.method === 'GET') {
      const result = await sql`SELECT * FROM posts WHERE id = ${id}`;
      if (result.rows.length === 0) return res.status(404).json({ error: 'Post não encontrado' });

      const post = result.rows[0];
      const related = await sql`
        SELECT id, title, cat, date, img
        FROM posts
        WHERE cat = ${post.cat} AND id != ${id}
        ORDER BY created_at DESC
        LIMIT 2
      `;
      return res.status(200).json({ ...post, related: related.rows });
    }

    if (req.method === 'PUT') {
      if (!requireAuth(req, res)) return;

      const parsed = validatePostInput(req.body || {});
      if (!parsed.ok) return res.status(400).json({ error: parsed.errors[0] });

      const exists = await sql`SELECT id FROM posts WHERE id = ${id}`;
      if (!exists.rows.length) return res.status(404).json({ error: 'Post não encontrado' });

      const { title, cat, read_time, img, yt_id, body, featured, img_pos } = parsed.data;

      if (featured) {
        await sql`UPDATE posts SET featured = false WHERE featured = true AND id <> ${id}`;
      }

      const result = await sql`
        UPDATE posts SET
          title     = ${title},
          cat       = ${cat},
          read_time = ${read_time},
          img       = ${img},
          yt_id     = ${yt_id},
          img_pos   = ${img_pos},
          body      = ${body},
          featured  = ${featured}
        WHERE id = ${id}
        RETURNING *
      `;

      return res.status(200).json(result.rows[0]);
    }

    if (req.method === 'DELETE') {
      if (!requireAuth(req, res)) return;

      const del = await sql`DELETE FROM posts WHERE id = ${id} RETURNING id`;
      if (!del.rows.length) return res.status(404).json({ error: 'Post não encontrado.' });
      return res.status(200).json({ ok: true });
    }
  } catch (err) {
    console.error('posts/[id]', err);
    return res.status(500).json({ error: 'Erro ao processar a solicitação.' });
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}

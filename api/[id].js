import { sql } from '../../lib/db.js';
import { requireAuth } from '../../lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  // GET — público
  if (req.method === 'GET') {
    const result = await sql`SELECT * FROM posts WHERE id = ${id}`;
    if (result.rows.length === 0) return res.status(404).json({ error: 'Post não encontrado' });

    // busca relacionados pela mesma categoria
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

  // PUT — protegido
  if (req.method === 'PUT') {
    if (!requireAuth(req, res)) return;

    const { title, cat, date, read_time, img, body, featured } = req.body;

    const result = await sql`
      UPDATE posts SET
        title     = COALESCE(${title}, title),
        cat       = COALESCE(${cat}, cat),
        date      = COALESCE(${date}, date),
        read_time = COALESCE(${read_time}, read_time),
        img       = COALESCE(${img}, img),
        body      = COALESCE(${body}, body),
        featured  = COALESCE(${featured}, featured)
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.rows.length === 0) return res.status(404).json({ error: 'Post não encontrado' });
    return res.status(200).json(result.rows[0]);
  }

  // DELETE — protegido
  if (req.method === 'DELETE') {
    if (!requireAuth(req, res)) return;

    await sql`DELETE FROM posts WHERE id = ${id}`;
    return res.status(200).json({ success: true });
  }

  res.status(405).end();
}

import { sql } from '../lib/db.js';
import { requireAuth } from '../lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — público
  if (req.method === 'GET') {
    const { cat } = req.query;

    if (cat && cat !== 'todos') {
      const result = await sql`
        SELECT * FROM posts
        WHERE LOWER(cat) = LOWER(${cat})
        ORDER BY created_at DESC
      `;
      return res.status(200).json(result.rows);
    }

    const result = await sql`
      SELECT * FROM posts
      ORDER BY featured DESC, created_at DESC
    `;
    return res.status(200).json(result.rows);
  }

  // POST — cria post
  if (req.method === 'POST') {
    if (!requireAuth(req, res)) return;

    const { title, cat, date, read_time, img, yt_id, body, featured } = req.body;

    if (!title || !cat || !body) {
      return res.status(400).json({ error: 'Campos obrigatórios: title, cat, body' });
    }
    if (!img && !yt_id) {
      return res.status(400).json({ error: 'Informe uma imagem de capa ou um vídeo do YouTube.' });
    }

    const result = await sql`
      INSERT INTO posts (title, cat, date, read_time, img, yt_id, body, featured)
      VALUES (
        ${title},
        ${cat},
        ${date || new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })},
        ${read_time || '3 min de leitura'},
        ${img || null},
        ${yt_id || null},
        ${body},
        ${featured || false}
      )
      RETURNING *
    `;

    return res.status(201).json(result.rows[0]);
  }

  // PUT — atualiza post
  if (req.method === 'PUT') {
    if (!requireAuth(req, res)) return;

    const id = req.query.id;
    if (!id) return res.status(400).json({ error: 'ID obrigatório.' });

    const { title, cat, read_time, img, yt_id, body, featured } = req.body;

    if (!title || !cat || !body) {
      return res.status(400).json({ error: 'Campos obrigatórios: title, cat, body' });
    }
    if (!img && !yt_id) {
      return res.status(400).json({ error: 'Informe uma imagem de capa ou um vídeo do YouTube.' });
    }

    const result = await sql`
      UPDATE posts SET
        title     = ${title},
        cat       = ${cat},
        read_time = ${read_time || '3 min de leitura'},
        img       = ${img   || null},
        yt_id     = ${yt_id || null},
        body      = ${body},
        featured  = ${featured || false}
      WHERE id = ${id}
      RETURNING *
    `;

    if (!result.rows.length) return res.status(404).json({ error: 'Post não encontrado.' });
    return res.status(200).json(result.rows[0]);
  }

  // DELETE — remove post
  if (req.method === 'DELETE') {
    if (!requireAuth(req, res)) return;

    const id = req.query.id;
    if (!id) return res.status(400).json({ error: 'ID obrigatório.' });

    await sql`DELETE FROM posts WHERE id = ${id}`;
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
import { sql } from '../lib/db.js';
import { requireAuth, optionalAuth } from '../lib/auth.js';
import { applyCors } from '../lib/cors.js';
import { ALLOWED_CATS, parsePostId, validatePostInput } from '../lib/validate.js';
import { allocateSlug } from '../lib/allocateSlug.js';

export default async function handler(req, res) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const showDrafts = optionalAuth(req);
      const { cat, page, limit } = req.query;
      
      const p = Math.max(1, parseInt(page) || 1);
      const lim = Math.max(1, Math.min(100, parseInt(limit) || 9));
      const off = (p - 1) * lim;

      if (cat && cat !== 'todos') {
        const c = String(cat).trim().toLowerCase();
        if (!ALLOWED_CATS.has(c)) {
          return res.status(400).json({ error: 'Categoria inválida.' });
        }
        const result = showDrafts
          ? await sql`
              SELECT * FROM posts
              WHERE LOWER(cat) = LOWER(${c})
              ORDER BY created_at DESC
              LIMIT ${lim} OFFSET ${off}
            `
          : await sql`
              SELECT * FROM posts
              WHERE LOWER(cat) = LOWER(${c}) AND COALESCE(status, 'published') = 'published'
              ORDER BY created_at DESC
              LIMIT ${lim} OFFSET ${off}
            `;
        return res.status(200).json(result.rows);
      }

      const result = showDrafts
        ? await sql`
            SELECT * FROM posts
            ORDER BY featured DESC, created_at DESC
            LIMIT ${lim} OFFSET ${off}
          `
        : await sql`
            SELECT * FROM posts
            WHERE COALESCE(status, 'published') = 'published'
            ORDER BY featured DESC, created_at DESC
            LIMIT ${lim} OFFSET ${off}
          `;
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      if (!requireAuth(req, res)) return;
      const parsed = validatePostInput(req.body || {});
      if (!parsed.ok) return res.status(400).json({ error: parsed.errors[0] });

      const {
        title,
        cat,
        date,
        read_time,
        img,
        yt_id,
        body,
        featured,
        img_pos,
        status,
        meta_description,
        img_alt,
        slug_custom,
      } = parsed.data;
      const dateVal =
        date ||
        new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

      if (featured) {
        await sql`UPDATE posts SET featured = false WHERE featured = true`;
      }

      const slug = await allocateSlug(sql, title, slug_custom, null);

      const result = await sql`
        INSERT INTO posts (
          title, cat, date, read_time, img, yt_id, img_pos, body, featured,
          status, slug, meta_description, img_alt
        )
        VALUES (
          ${title},
          ${cat},
          ${dateVal},
          ${read_time},
          ${img},
          ${yt_id},
          ${img_pos},
          ${body},
          ${featured},
          ${status},
          ${slug},
          ${meta_description},
          ${img_alt}
        )
        RETURNING *
      `;

      return res.status(201).json(result.rows[0]);
    }

    if (req.method === 'PUT') {
      if (!requireAuth(req, res)) return;
      const id = parsePostId(req.query.id);
      if (!id) return res.status(400).json({ error: 'ID inválido.' });

      const parsed = validatePostInput(req.body || {});
      if (!parsed.ok) return res.status(400).json({ error: parsed.errors[0] });

      const row = await sql`SELECT id FROM posts WHERE id = ${id}`;
      if (!row.rows.length) return res.status(404).json({ error: 'Post não encontrado.' });

      const {
        title,
        cat,
        read_time,
        img,
        yt_id,
        body,
        featured,
        img_pos,
        status,
        meta_description,
        img_alt,
        slug_custom,
      } = parsed.data;

      if (featured) {
        await sql`UPDATE posts SET featured = false WHERE featured = true AND id <> ${id}`;
      }

      const slug = await allocateSlug(sql, title, slug_custom, id);

      const result = await sql`
        UPDATE posts SET
          title            = ${title},
          cat              = ${cat},
          read_time        = ${read_time},
          img              = ${img},
          yt_id            = ${yt_id},
          img_pos          = ${img_pos},
          body             = ${body},
          featured         = ${featured},
          status           = ${status},
          slug             = ${slug},
          meta_description = ${meta_description},
          img_alt          = ${img_alt}
        WHERE id = ${id}
        RETURNING *
      `;

      return res.status(200).json(result.rows[0]);
    }

    if (req.method === 'DELETE') {
      if (!requireAuth(req, res)) return;
      const id = parsePostId(req.query.id);
      if (!id) return res.status(400).json({ error: 'ID inválido.' });

      const del = await sql`DELETE FROM posts WHERE id = ${id} RETURNING id`;
      if (!del.rows.length) return res.status(404).json({ error: 'Post não encontrado.' });
      return res.status(200).json({ ok: true });
    }
  } catch (err) {
    console.error('posts', err);
    return res.status(500).json({ error: 'Erro ao processar a solicitação.' });
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}

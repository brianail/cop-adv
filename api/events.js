import { sql } from '../lib/db.js';
import { requireAuth, optionalAuth } from '../lib/auth.js';
import { applyCors } from '../lib/cors.js';
import { parsePostId, validateEventInput } from '../lib/validate.js';
import { allocateSlug } from '../lib/allocateSlug.js';

export default async function handler(req, res) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const authed = optionalAuth(req);
      const onlyUpcoming = String(req.query?.upcoming || '') === '1';
      const limitN = parsePostId(req.query?.limit) || 0;
      const lim = limitN > 0 ? Math.min(limitN, 20) : null;

      const result = authed
        ? await sql.unsafe(
            `SELECT * FROM events
             ${onlyUpcoming ? "WHERE event_date >= CURRENT_DATE" : ''}
             ORDER BY event_date ASC, COALESCE(event_time, '23:59') ASC
             ${lim ? `LIMIT ${lim}` : ''}`
          )
        : await sql.unsafe(
            `SELECT * FROM events
             WHERE COALESCE(status, 'published') = 'published'
             ${onlyUpcoming ? "AND event_date >= CURRENT_DATE" : ''}
             ORDER BY event_date ASC, COALESCE(event_time, '23:59') ASC
             ${lim ? `LIMIT ${lim}` : ''}`
          );
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      if (!requireAuth(req, res)) return;
      const parsed = validateEventInput(req.body || {});
      if (!parsed.ok) return res.status(400).json({ error: parsed.errors[0] });

      const {
        title,
        status,
        event_date,
        event_time,
        location,
        img,
        description,
        slug_custom,
        meta_description,
        img_alt,
      } = parsed.data;

      const slug = await allocateSlug(sql, title, slug_custom, null, 'events');
      const result = await sql`
        INSERT INTO events (
          title, status, event_date, event_time, location, img, description, slug, meta_description, img_alt
        ) VALUES (
          ${title}, ${status}, ${event_date}, ${event_time}, ${location}, ${img}, ${description},
          ${slug}, ${meta_description}, ${img_alt}
        ) RETURNING *
      `;
      return res.status(201).json(result.rows[0]);
    }

    if (req.method === 'DELETE') {
      if (!requireAuth(req, res)) return;
      const id = parsePostId(req.query.id);
      if (!id) return res.status(400).json({ error: 'ID inválido.' });
      const del = await sql`DELETE FROM events WHERE id = ${id} RETURNING id`;
      if (!del.rows.length) return res.status(404).json({ error: 'Evento não encontrado.' });
      return res.status(200).json({ ok: true });
    }
  } catch (err) {
    console.error('events', err);
    return res.status(500).json({ error: 'Erro ao processar a solicitação.' });
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}

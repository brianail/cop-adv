import { sql } from '../../lib/db.js';
import { requireAuth, optionalAuth } from '../../lib/auth.js';
import { applyCors } from '../../lib/cors.js';
import { parsePostId, validateEventInput } from '../../lib/validate.js';
import { allocateSlug } from '../../lib/allocateSlug.js';

export default async function handler(req, res) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const id = parsePostId(req.query.id);
  if (!id) {
    if (req.method === 'GET') return res.status(404).json({ error: 'Evento não encontrado' });
    return res.status(400).json({ error: 'ID inválido.' });
  }

  try {
    if (req.method === 'GET') {
      const authed = optionalAuth(req);
      const result = await sql`SELECT * FROM events WHERE id = ${id}`;
      if (!result.rows.length) return res.status(404).json({ error: 'Evento não encontrado' });
      const event = result.rows[0];
      if ((event.status || 'published') === 'draft' && !authed) {
        return res.status(404).json({ error: 'Evento não encontrado' });
      }
      return res.status(200).json(event);
    }

    if (req.method === 'PUT') {
      if (!requireAuth(req, res)) return;
      const parsed = validateEventInput(req.body || {});
      if (!parsed.ok) return res.status(400).json({ error: parsed.errors[0] });
      const exists = await sql`SELECT id FROM events WHERE id = ${id}`;
      if (!exists.rows.length) return res.status(404).json({ error: 'Evento não encontrado' });

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

      const slug = await allocateSlug(sql, title, slug_custom, id, 'events');
      const result = await sql`
        UPDATE events SET
          title = ${title},
          status = ${status},
          event_date = ${event_date},
          event_time = ${event_time},
          location = ${location},
          img = ${img},
          description = ${description},
          slug = ${slug},
          meta_description = ${meta_description},
          img_alt = ${img_alt}
        WHERE id = ${id}
        RETURNING *
      `;
      return res.status(200).json(result.rows[0]);
    }

    if (req.method === 'DELETE') {
      if (!requireAuth(req, res)) return;
      const del = await sql`DELETE FROM events WHERE id = ${id} RETURNING id`;
      if (!del.rows.length) return res.status(404).json({ error: 'Evento não encontrado.' });
      return res.status(200).json({ ok: true });
    }
  } catch (err) {
    console.error('events/[id]', err);
    return res.status(500).json({ error: 'Erro ao processar a solicitação.' });
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}

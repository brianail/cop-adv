import { sql } from '../lib/db.js';

export default async function handler(req, res) {
  // Segurança mínima — só roda com ?secret=
  if (req.query.secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  try {
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS slug      TEXT`;
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS excerpt   TEXT`;
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_desc TEXT`;
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS status    TEXT DEFAULT 'published'`;
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS yt_id     TEXT`;

    // Garante que posts antigos sem status fiquem como publicados
    await sql`UPDATE posts SET status = 'published' WHERE status IS NULL`;

    return res.status(200).json({ ok: true, msg: 'Migration concluída.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
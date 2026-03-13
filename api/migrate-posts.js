import { sql } from '../lib/db.js';
import { requireAuth } from '../lib/auth.js';

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  try {
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS slug      TEXT`;
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS excerpt   TEXT`;
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_desc TEXT`;
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS status    TEXT DEFAULT 'published'`;
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS yt_id     TEXT`;
    await sql`UPDATE posts SET status = 'published' WHERE status IS NULL`;

    return res.status(200).json({ ok: true, msg: 'Migration concluída.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
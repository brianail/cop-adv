import { sql } from '../lib/db.js';
import { requireAuth } from '../lib/auth.js';
import { applyCors } from '../lib/cors.js';

export default async function handler(req, res) {
  applyCors(res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();
  if (!requireAuth(req, res)) return;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id         SERIAL PRIMARY KEY,
        title      TEXT NOT NULL,
        cat        TEXT NOT NULL,
        date       TEXT NOT NULL,
        read_time  TEXT NOT NULL,
        img        TEXT,
        body       TEXT NOT NULL,
        featured   BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS yt_id TEXT`;
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS img_pos TEXT`;
    await sql`ALTER TABLE posts ALTER COLUMN img DROP NOT NULL`;

    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published'`;
    await sql`UPDATE posts SET status = 'published' WHERE status IS NULL`;
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS slug TEXT`;
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_description TEXT`;
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS img_alt TEXT`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS posts_slug_unique ON posts (slug) WHERE slug IS NOT NULL`;

    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id               SERIAL PRIMARY KEY,
        title            TEXT NOT NULL,
        event_date       DATE NOT NULL,
        event_time       TEXT,
        location         TEXT,
        img              TEXT,
        description      TEXT,
        status           TEXT DEFAULT 'published',
        slug             TEXT,
        meta_description TEXT,
        img_alt          TEXT,
        created_at       TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS events_slug_unique ON events (slug) WHERE slug IS NOT NULL`;

    await sql`
      CREATE TABLE IF NOT EXISTS newsletter (
        id         SERIAL PRIMARY KEY,
        email      TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    return res.status(200).json({ ok: true, tables: ['posts', 'events', 'newsletter'] });
  } catch (err) {
    console.error('setup', err);
    return res.status(500).json({ error: 'Falha ao preparar o banco.' });
  }
}

import { sql } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id        SERIAL PRIMARY KEY,
        title     TEXT NOT NULL,
        cat       TEXT NOT NULL,
        date      TEXT NOT NULL,
        read_time TEXT NOT NULL,
        img       TEXT NOT NULL,
        body      TEXT NOT NULL,
        featured  BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS newsletter (
        id         SERIAL PRIMARY KEY,
        email      TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    return res.status(200).json({ ok: true, tables: ['posts', 'newsletter'] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
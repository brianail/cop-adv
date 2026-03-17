import { sql } from '../lib/db.js';

export default async function handler(req, res) {
  // Mantemos a segurança de aceitar apenas POST
  if (req.method !== 'POST') return res.status(405).end();

  try {
    // 1. Tabela de Publicações
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

    // 2. Tabela da Newsletter
    await sql`
      CREATE TABLE IF NOT EXISTS newsletter (
        id         SERIAL PRIMARY KEY,
        email      TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // 3. NOVA: Tabela do Corpo Jurídico
    await sql`
      CREATE TABLE IF NOT EXISTS team (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    return res.status(200).json({ ok: true, tables: ['posts', 'newsletter', 'team'] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
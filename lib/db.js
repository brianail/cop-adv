import { sql } from '@vercel/postgres';

export { sql };

// Cria a tabela se não existir (chamado uma vez no setup)
export async function initDB() {
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
}

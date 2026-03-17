import { sql } from '@vercel/postgres';

export { sql };

// Cria as tabelas se não existirem (chamado uma vez no setup)
export async function initDB() {
  // Tabela de publicações
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

  // NOVA: Tabela do Corpo Jurídico
  await sql`
    CREATE TABLE IF NOT EXISTS team (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}
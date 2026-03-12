import { sql } from '../lib/db.js';
import { requireAuth } from '../lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — público, retorna todos os posts ordenados por data
  if (req.method === 'GET') {
    const { cat } = req.query;
    let result;

    if (cat && cat !== 'todos') {
      result = await sql`
        SELECT * FROM posts
        WHERE LOWER(cat) = LOWER(${cat})
        ORDER BY created_at DESC
      `;
    } else {
      result = await sql`
        SELECT * FROM posts
        ORDER BY featured DESC, created_at DESC
      `;
    }

    return res.status(200).json(result.rows);
  }

  // POST — protegido, cria novo post
  if (req.method === 'POST') {
    if (!requireAuth(req, res)) return;

    const { title, cat, date, read_time, img, body, featured } = req.body;

    if (!title || !cat || !img || !body) {
      return res.status(400).json({ error: 'Campos obrigatórios: title, cat, img, body' });
    }

    const result = await sql`
      INSERT INTO posts (title, cat, date, read_time, img, body, featured)
      VALUES (
        ${title},
        ${cat},
        ${date || new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })},
        ${read_time || '3 min de leitura'},
        ${img},
        ${body},
        ${featured || false}
      )
      RETURNING *
    `;

    return res.status(201).json(result.rows[0]);
  }

  res.status(405).end();
}

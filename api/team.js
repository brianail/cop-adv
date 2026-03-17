import { sql } from '../lib/db'; 
import { authMiddleware } from '../lib/auth'; // Ajuste se o nome da sua função for diferente

export default async function handler(req, res) {
  // GET: Público (lista os advogados no site principal e no painel)
  if (req.method === 'GET') {
    try {
      const { rows } = await sql`SELECT * FROM team ORDER BY name ASC;`;
      return res.status(200).json(rows);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao buscar corpo jurídico' });
    }
  }

  // POST: Protegido (adiciona novo advogado via painel)
  if (req.method === 'POST') {
    const isAuth = await authMiddleware(req, res);
    if (!isAuth) return;

    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'O nome é obrigatório' });

    try {
      const { rows } = await sql`
        INSERT INTO team (name) 
        VALUES (${name}) 
        RETURNING *;
      `;
      return res.status(201).json(rows[0]);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao adicionar advogado' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
import { sql } from '../../lib/db';
import { authMiddleware } from '../../lib/auth';

export default async function handler(req, res) {
  const { id } = req.query;

  // Todas as rotas aqui alteram dados, então exigem autenticação
  const isAuth = await authMiddleware(req, res);
  if (!isAuth) return;

  // PUT: Atualiza o nome do advogado
  if (req.method === 'PUT') {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'O nome é obrigatório' });

    try {
      const { rows } = await sql`
        UPDATE team 
        SET name = ${name} 
        WHERE id = ${id} 
        RETURNING *;
      `;
      if (rows.length === 0) return res.status(404).json({ error: 'Advogado não encontrado' });
      return res.status(200).json(rows[0]);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao atualizar advogado' });
    }
  }

  // DELETE: Remove o advogado
  if (req.method === 'DELETE') {
    try {
      const { rows } = await sql`
        DELETE FROM team 
        WHERE id = ${id} 
        RETURNING *;
      `;
      if (rows.length === 0) return res.status(404).json({ error: 'Advogado não encontrado' });
      return res.status(200).json({ message: 'Advogado removido com sucesso' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao remover advogado' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
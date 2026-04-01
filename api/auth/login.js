import jwt from 'jsonwebtoken';
import { jwtSecretOk, safePasswordEqual } from '../../lib/auth.js';
import { applyCors } from '../../lib/cors.js';

export default function handler(req, res) {
  applyCors(res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });

  if (!jwtSecretOk()) {
    return res.status(500).json({ error: 'Servidor mal configurado.' });
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof expected !== 'string') {
    return res.status(500).json({ error: 'Servidor mal configurado.' });
  }

  const body = req.body || {};
  const password = typeof body.password === 'string' ? body.password : '';
  if (password.length > 200) {
    return res.status(400).json({ error: 'Requisição inválida.' });
  }

  if (!safePasswordEqual(password, expected)) {
    return res.status(401).json({ error: 'Senha incorreta' });
  }

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
  return res.status(200).json({ token });
}

import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export function jwtSecretOk() {
  const s = process.env.JWT_SECRET;
  return typeof s === 'string' && s.length >= 16;
}

export function safePasswordEqual(plain, expected) {
  if (typeof plain !== 'string' || typeof expected !== 'string' || !expected) return false;
  const a = crypto.createHash('sha256').update(plain, 'utf8').digest();
  const b = crypto.createHash('sha256').update(expected, 'utf8').digest();
  return crypto.timingSafeEqual(a, b);
}

export function requireAuth(req, res) {
  if (!jwtSecretOk()) {
    res.status(500).json({ error: 'Servidor mal configurado.' });
    return false;
  }
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Não autorizado' });
    return false;
  }
  try {
    jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    return true;
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' });
    return false;
  }
}

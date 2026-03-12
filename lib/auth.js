import jwt from 'jsonwebtoken';

export function requireAuth(req, res) {
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

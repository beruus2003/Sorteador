import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SESSION_SECRET || 'your-secret-key-change-in-production';

export function generateToken(userId, email) {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(req, res) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Token não fornecido' };
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, userId: decoded.userId, email: decoded.email };
  } catch (error) {
    return { valid: false, error: 'Token inválido ou expirado' };
  }
}

export function requireAuth(handler) {
  return async (req, res) => {
    const auth = verifyToken(req, res);
    
    if (!auth.valid) {
      return res.status(401).json({ success: false, message: auth.error });
    }

    req.user = { userId: auth.userId, email: auth.email };
    return handler(req, res);
  };
}

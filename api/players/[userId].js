import pool from '../db.js';
import { requireAuth } from '../auth-middleware.js';

async function handler(req, res) {
  const { userId } = req.params;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  if (parseInt(userId) !== req.user.userId) {
    return res.status(403).json({ success: false, message: 'Acesso negado' });
  }

  try {
    const result = await pool.query(
      'SELECT id, name, stars as level, present FROM players WHERE user_id = $1 ORDER BY id ASC',
      [userId]
    );

    return res.status(200).json({ success: true, players: result.rows });
  } catch (error) {
    console.error('Erro ao buscar jogadores:', error);
    return res.status(500).json({ success: false, message: 'Erro ao buscar jogadores' });
  }
}

export default requireAuth(handler);

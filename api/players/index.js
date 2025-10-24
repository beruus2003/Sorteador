import pool from '../db.js';
import { requireAuth } from '../auth-middleware.js';

async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { name, level } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, message: 'name é obrigatório' });
      }

      const result = await pool.query(
        'INSERT INTO players (user_id, name, stars, present) VALUES ($1, $2, $3, true) RETURNING id, name, stars as level, present',
        [req.user.userId, name, level || 3]
      );

      return res.status(201).json({ success: true, player: result.rows[0] });
    } catch (error) {
      console.error('Erro ao criar jogador:', error);
      return res.status(500).json({ success: false, message: 'Erro ao criar jogador' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}

export default requireAuth(handler);

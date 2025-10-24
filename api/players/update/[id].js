import pool from '../../db.js';
import { requireAuth } from '../../auth-middleware.js';

async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PATCH') {
    try {
      const { present } = req.body;

      if (typeof present !== 'boolean') {
        return res.status(400).json({ success: false, message: 'present deve ser boolean' });
      }

      const checkResult = await pool.query(
        'SELECT user_id FROM players WHERE id = $1',
        [id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Jogador não encontrado' });
      }

      if (checkResult.rows[0].user_id !== req.user.userId) {
        return res.status(403).json({ success: false, message: 'Acesso negado' });
      }

      const result = await pool.query(
        'UPDATE players SET present = $1 WHERE id = $2 RETURNING *',
        [present, id]
      );

      return res.status(200).json({ success: true, player: result.rows[0] });
    } catch (error) {
      console.error('Erro ao atualizar jogador:', error);
      return res.status(500).json({ success: false, message: 'Erro ao atualizar jogador' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const checkResult = await pool.query(
        'SELECT user_id FROM players WHERE id = $1',
        [id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Jogador não encontrado' });
      }

      if (checkResult.rows[0].user_id !== req.user.userId) {
        return res.status(403).json({ success: false, message: 'Acesso negado' });
      }

      const result = await pool.query(
        'DELETE FROM players WHERE id = $1 RETURNING *',
        [id]
      );

      return res.status(200).json({ success: true, message: 'Jogador deletado' });
    } catch (error) {
      console.error('Erro ao deletar jogador:', error);
      return res.status(500).json({ success: false, message: 'Erro ao deletar jogador' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}

export default requireAuth(handler);

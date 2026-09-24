const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/assuntos -> lista todos os assuntos ativos (pra montar os cards)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, titulo, descricao, slug, icone, ordem
       FROM assuntos
       WHERE ativo = true
       ORDER BY ordem ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: 'Falha na conexão com o banco: ' + err.message });
  }
});

module.exports = router;
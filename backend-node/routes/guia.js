const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/guia/:slug -> assunto + fullGuide (passos com imagens) + quickGuide
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    const { rows: assuntoRows } = await pool.query(
      `SELECT id, titulo, descricao, slug, video_url
       FROM assuntos
       WHERE slug = $1 AND ativo = true`,
      [slug]
    );

    const assunto = assuntoRows[0];
    if (!assunto) {
      return res.status(404).json({ erro: 'Assunto não encontrado' });
    }

    const { rows: passos } = await pool.query(
      `SELECT id, titulo, descricao, ordem
       FROM passos
       WHERE assunto_id = $1
       ORDER BY ordem ASC`,
      [assunto.id]
    );

    for (const passo of passos) {
      const { rows: imagens } = await pool.query(
        `SELECT url FROM passo_imagens WHERE passo_id = $1 ORDER BY ordem ASC`,
        [passo.id]
      );
      passo.imagens = imagens.map((i) => i.url);
      delete passo.id;
    }

    res.json({
      assunto,
      fullGuide: passos,
      quickGuide: passos.map((p) => p.titulo),
    });
  } catch (err) {
    res.status(500).json({ erro: 'Falha na conexão com o banco: ' + err.message });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const pool = require('../config/database');
const autenticar = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });


// GET /api/assuntos
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
    res.status(500).json({
      erro: 'Falha na conexão com o banco: ' + err.message
    });
  }
});


// PUT /api/assuntos/:id
router.put('/:id',autenticar, upload.any(), async (req, res) => {

  const { id } = req.params;

  const {
    titulo,
    descricao,
    icone,
    video_url,
    passos: passosJson
  } = req.body;


  if (!titulo) {
    return res.status(400).json({
      erro: 'O título é obrigatório'
    });
  }


  let passos;

  try {
    passos = JSON.parse(passosJson || '[]');
  } catch {
    return res.status(400).json({
      erro: 'Passos inválidos'
    });
  }


  const client = await pool.connect();


  try {

    await client.query('BEGIN');


    // =====================================================
    // 1. ATUALIZA O ASSUNTO
    // =====================================================

    const { rows: assuntoRows } = await client.query(
      `UPDATE assuntos
       SET titulo = $1,
           descricao = $2,
           icone = $3,
           video_url = $4
       WHERE id = $5
       RETURNING id, titulo, descricao, slug, icone, video_url, ordem, ativo`,
      [
        titulo,
        descricao || null,
        icone || null,
        video_url || null,
        id
      ]
    );


    if (assuntoRows.length === 0) {

      await client.query('ROLLBACK');

      return res.status(404).json({
        erro: 'Assunto não encontrado'
      });
    }


    const assunto = assuntoRows[0];


    // =====================================================
    // 2. PASTA DAS IMAGENS
    // =====================================================

    const pastaUpload = path.join(
      __dirname,
      '..',
      'uploads',
      assunto.slug
    );


    fs.mkdirSync(pastaUpload, {
      recursive: true
    });


    // =====================================================
    // 3. PEGA OS PASSOS EXISTENTES
    // =====================================================

    const { rows: passosExistentes } = await client.query(
      `SELECT id
       FROM passos
       WHERE assunto_id = $1`,
      [id]
    );


    const idsRecebidos = [];


    // =====================================================
    // 4. ATUALIZA / CRIA OS PASSOS
    // =====================================================

    for (let index = 0; index < passos.length; index++) {

      const passo = passos[index];


      let passoId;


      // ---------------------------------------------
      // PASSO EXISTENTE
      // ---------------------------------------------

      if (passo.id) {

        const { rows } = await client.query(
          `UPDATE passos
           SET titulo = $1,
               descricao = $2,
               ordem = $3
           WHERE id = $4
             AND assunto_id = $5
           RETURNING id`,
          [
            passo.titulo || '',
            passo.descricao || '',
            index,
            passo.id,
            id
          ]
        );


        if (rows.length > 0) {
          passoId = rows[0].id;
        }

      }


      // ---------------------------------------------
      // NOVO PASSO
      // ---------------------------------------------

      if (!passoId) {

        const { rows } = await client.query(
          `INSERT INTO passos
           (assunto_id, titulo, descricao, ordem)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [
            id,
            passo.titulo || '',
            passo.descricao || '',
            index
          ]
        );

        passoId = rows[0].id;
      }


      idsRecebidos.push(passoId);


      // =================================================
      // 5. IMAGENS DO PASSO
      // =================================================

      // Imagens antigas que continuam no passo
      const imagensExistentes = Array.isArray(passo.imagens)
        ? passo.imagens.filter((img) => typeof img === 'string')
        : [];


      // Remove imagens antigas que não estão mais no frontend
      await client.query(
        `DELETE FROM passo_imagens
         WHERE passo_id = $1
         AND url <> ALL($2::text[])`,
        [
          passoId,
          imagensExistentes.length > 0
            ? imagensExistentes
            : ['__nenhuma_imagem__']
        ]
      );


      // ---------------------------------------------
      // NOVAS IMAGENS
      // ---------------------------------------------

      const arquivos = (req.files || []).filter(
        (file) => file.fieldname === `imagem_${index}`
      );


      for (let imgIndex = 0; imgIndex < arquivos.length; imgIndex++) {

        const arquivo = arquivos[imgIndex];

        const extensao = path.extname(
          arquivo.originalname
        );


        const nomeArquivo =
          `passo${index + 1}_${Date.now()}_${imgIndex}${extensao}`;


        const caminhoDestino = path.join(
          pastaUpload,
          nomeArquivo
        );


        fs.writeFileSync(
          caminhoDestino,
          arquivo.buffer
        );


        const urlPublica =
          `uploads/${assunto.slug}/${nomeArquivo}`;


        await client.query(
          `INSERT INTO passo_imagens
           (passo_id, url, ordem)
           VALUES ($1, $2, $3)`,
          [
            passoId,
            urlPublica,
            imagensExistentes.length + imgIndex
          ]
        );
      }
    }


    // =====================================================
    // 6. REMOVE PASSOS QUE FORAM EXCLUÍDOS
    // =====================================================

    if (idsRecebidos.length > 0) {

      await client.query(
        `DELETE FROM passos
         WHERE assunto_id = $1
         AND id <> ALL($2::uuid[])`,
        [
          id,
          idsRecebidos
        ]
      );

    } else {

      await client.query(
        `DELETE FROM passos
         WHERE assunto_id = $1`,
        [id]
      );

    }


    await client.query('COMMIT');


    res.json({
      sucesso: true,
      assunto
    });


  } catch (err) {

    await client.query('ROLLBACK');

    console.error(err);

    res.status(500).json({
      erro: 'Falha ao atualizar: ' + err.message
    });

  } finally {

    client.release();

  }

});

// PATCH /api/assuntos/:id/desativar
router.patch('/:id/desativar',autenticar, async (req, res) => {

  const { id } = req.params;

  try {

    const { rows } = await pool.query(
      `UPDATE assuntos
       SET ativo = false
       WHERE id = $1
       RETURNING id, titulo, ativo`,
      [id]
    );


    if (rows.length === 0) {
      return res.status(404).json({
        erro: 'Assunto não encontrado'
      });
    }


    res.json({
      sucesso: true,
      mensagem: 'Assunto desativado com sucesso',
      assunto: rows[0]
    });


  } catch (err) {

    console.error(err);

    res.status(500).json({
      erro: 'Falha ao desativar assunto: ' + err.message
    });

  }
});


module.exports = router;
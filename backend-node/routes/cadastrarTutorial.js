const express = require('express');
const router = express.Router();
const autenticar = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const pool = require('../config/database');
const slugify = require('../utils/slugify');
const supabase = require('../config/supabase');

const upload = multer({ storage: multer.memoryStorage() });

// POST /api/cadastrar-tutorial
// Espera multipart/form-data com: titulo, descricao, icone, video_url,
// passos (string JSON: [{"titulo":"...","descricao":"..."}]),
// e arquivos imagem_0, imagem_1... (um por passo)
router.post('/', autenticar, upload.any(), async (req, res) => {
  const { titulo, descricao, video_url, icone, passos: passosJson } = req.body;

  if (!titulo || !passosJson) {
    return res.status(400).json({ erro: 'Título e passos são obrigatórios' });
  }

  let passos;
  try {
    passos = JSON.parse(passosJson);
  } catch {
    return res.status(400).json({ erro: 'Passos inválidos, envie um JSON válido' });
  }

  if (!Array.isArray(passos) || passos.length === 0) {
    return res.status(400).json({ erro: 'Envie pelo menos 1 passo' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Garante slug único
    let slug = slugify(titulo);
    const slugBase = slug;
    let contador = 1;
    while (true) {
      const { rows } = await client.query('SELECT 1 FROM assuntos WHERE slug = $1', [slug]);
      if (rows.length === 0) break;
      slug = `${slugBase}-${++contador}`;
    }

    // Calcula a próxima ordem
    const { rows: ordemRows } = await client.query(
      'SELECT COALESCE(MAX(ordem), 0) + 1 AS nova FROM assuntos'
    );
    const novaOrdem = ordemRows[0].nova;

    // 1) Cria o assunto
    const { rows: assuntoRows } = await client.query(
      `INSERT INTO assuntos (titulo, descricao, slug, icone, video_url, ordem)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [titulo, descricao || null, slug, icone || null, video_url || null, novaOrdem]
    );
    const assuntoId = assuntoRows[0].id;


    // 2) Cria cada passo + sua imagem (se enviada)
    for (let index = 0; index < passos.length; index++) {
      const passo = passos[index];

      const { rows: passoRows } = await client.query(
        `INSERT INTO passos (assunto_id, titulo, descricao, ordem)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [assuntoId, passo.titulo || '', passo.descricao || '', index]
      );
      const passoId = passoRows[0].id;

      const arquivo = (req.files || []).find(
        (f) => f.fieldname === `imagem_${index}`
      );

      if (arquivo) {
        const extensao = path.extname(arquivo.originalname);

        // Nome único do arquivo
        const nomeArquivo = `${slug}/passo${index + 1}_${Date.now()}${extensao}`;

        // Upload para o Supabase Storage
        const { error: erroUpload } = await supabase.storage
          .from('imagens-guias')
          .upload(nomeArquivo, arquivo.buffer, {
            contentType: arquivo.mimetype,
            upsert: true,
          });

        if (erroUpload) {
          throw new Error(
            'Erro ao enviar imagem para o Storage: ' +
            erroUpload.message
          );
        }

        // Gera URL pública
        const { data } = supabase.storage
          .from('imagens-guias')
          .getPublicUrl(nomeArquivo);

        const urlPublica = data.publicUrl;

        // Salva no banco
        await client.query(
          `INSERT INTO passo_imagens (passo_id, url, ordem)
     VALUES ($1, $2, 0)`,
          [passoId, urlPublica]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ sucesso: true, id: assuntoId, slug });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ erro: 'Falha ao cadastrar: ' + err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
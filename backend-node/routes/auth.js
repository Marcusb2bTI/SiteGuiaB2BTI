const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();
const pool = require('../config/database');


// POST /api/auth/login
router.post('/login', async (req, res) => {

  const { usuario, senha } = req.body;

  // Verifica se os campos foram enviados
  if (!usuario || !senha) {
    return res.status(400).json({
      erro: 'Usuário e senha são obrigatórios'
    });
  }


  try {

    // Busca o usuário no banco
    const { rows } = await pool.query(
      `SELECT id, usuario, senha, ativo
       FROM usuarios
       WHERE usuario = $1
       LIMIT 1`,
      [usuario]
    );


    // Usuário não encontrado
    if (rows.length === 0) {
      return res.status(401).json({
        erro: 'Usuário ou senha inválidos'
      });
    }


    const usuarioBanco = rows[0];


    // Verifica se o usuário está ativo
    if (!usuarioBanco.ativo) {
      return res.status(403).json({
        erro: 'Usuário desativado'
      });
    }


    // Compara a senha digitada com o hash do banco
    const senhaCorreta = await bcrypt.compare(
      senha,
      usuarioBanco.senha
    );


    if (!senhaCorreta) {
      return res.status(401).json({
        erro: 'Usuário ou senha inválidos'
      });
    }


    // Cria o token
    const token = jwt.sign(
      {
        id: usuarioBanco.id,
        usuario: usuarioBanco.usuario
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '8h'
      }
    );


    // Retorna o token
    res.json({
      sucesso: true,
      token,
      usuario: {
        id: usuarioBanco.id,
        usuario: usuarioBanco.usuario
      }
    });


  } catch (err) {

    console.error(err);

    res.status(500).json({
      erro: 'Erro ao realizar login: ' + err.message
    });

  }

});


module.exports = router;